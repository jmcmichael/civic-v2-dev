import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyAttributeEvent } from '@ngx-formly/core/lib/models'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject, Subject } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import { InterpretedService, XstateAngular } from 'xstate-angular'
import {
  EntitySelectContext,
  EntitySelectEvent,
  EntitySelectSchema,
  getEntitySelectMachine,
} from './entity-select.xstate'

export type CvcSelectEntityName = { singular: string; plural: string }

export type CvcEntitySelectParamMsgFn = (
  searchStr: string,
  paramStr?: string
) => string

/* SELECT MESSAGES - displayed at top of options dropdown
 * - loading: while API requests loading, e.g. "Loading Variants..."
 * - empty: if no results returned, e.g. "No BRAF Variants found matching V600000"
 *   NOTE: if cvcCreateEntity provided, its quick-add form will be displayed instead, which will include its own prompt, e.g. "No BRAF Variants found matching V60000, would you like to create it?"
 * */
export type CvcEntitySelectMessageOptions2 = Partial<{
  loading: CvcEntitySelectParamMsgFn
  empty: CvcEntitySelectParamMsgFn
}>

export type CvcEntitySelectMessageMode =
  | 'idle'
  | 'entering'
  | 'loading'
  | 'options'
  | 'empty'
  | 'error'

export type CvcSelectMessageOptions = {
  // displayed after click or select, helptext indicating
  // the the field(s) searched, e.g. 'Searches Gene names and aliases'
  focus: string
  // displayed beneath select input, while server request is loading,
  // e.g. 'Loading Entities...'
  loading: string
  // displayed if no records match search string
  // e.g. 'No ENTITY_NAME_PLURAL found matching "SEARCH_STRING"'
  notfound: string
  // displayed if no records match search string, and optional param
  // was used in search.
  //  e.g. 'No PARAM_NAME ENTITY_NAME_PLURAL found matching "SEARCH_STRING"'
  notFoundWithParam: string
  // displayed if entity-select has been provided a template w/ add entity component
  // e.g. 'Create an entity named "SEARCH_STRING"?'
  create: string
}

@UntilDestroy({ arrayName: 'stateSubscriptions' })
@Component({
  selector: 'cvc-entity-select',
  templateUrl: './entity-select.component.html',
  styleUrls: ['./entity-select.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcEntitySelectComponent implements OnChanges, AfterViewInit {
  @Input() cvcFormControl!: FormControl
  @Input() cvcFormlyAttributes!: FormlyFieldConfig
  @Input() cvcEntityName: CvcSelectEntityName = {
    singular: 'Entity',
    plural: 'Entities',
  }
  @Input() cvcSelectMessages?: CvcSelectMessageOptions
  @Input() cvcSelectMode: 'multiple' | 'tags' | 'default' = 'default'
  @Input() cvcPlaceholder?: string
  @Input() cvcLoading?: boolean = false
  @Input() cvcOptions?: NzSelectOptionInterface[]
  // search results, provided by EntityTagFieldMixin's result$ (or other search results observable)
  @Input() cvcResults?: any[]
  @Input() cvcShowError: boolean = false
  @Input() cvcDisabled?: boolean = false
  @Input() cvcAllowClear: boolean = true
  @Input() cvcBorderless?: boolean = false
  @Input() cvcShowArrow?: boolean
  @Input() cvcAutoClearSearchValue: boolean = true
  // custom template for field value render
  @Input() cvcCustomTemplate?: TemplateRef<any> | null = null
  // additional content displayed at bottom of options dropdown
  @Input() cvcDropdownExtra?: TemplateRef<any> | null = null
  @Input() cvcDropdownClassname?: string | string[] = []
  // templateref w/ entity's quick-add form component
  @Input() cvcAddEntity: TemplateRef<any> | null = null
  @Input() cvcOnCreate?: Subject<number>
  // model update callback fn - ngx-formly convention, implements props.change feature
  @Input() cvcModelChange?: FormlyAttributeEvent

  @Output() readonly cvcOnSearch = new EventEmitter<string>()
  @Output() readonly cvcOnFocus = new EventEmitter<void>()
  @Output() readonly cvcOnBlur = new EventEmitter<void>()
  @Output() readonly cvcOnOpenChange = new EventEmitter<boolean>()

  // SOURCE STREAMS
  onFocus$: Subject<void>
  onOpenChange$: Subject<boolean>
  onSearch$: BehaviorSubject<Maybe<string>>
  onMessageMode$: BehaviorSubject<Maybe<CvcEntitySelectMessageMode>>

  // INTERMEDIATE STREAMS
  onResult$: Subject<any[]>

  // PRESENTATION STREAMS
  onLoading$: BehaviorSubject<boolean>
  onOption$: Subject<NzSelectOptionInterface[]>

  state!: InterpretedService<
    EntitySelectContext,
    EntitySelectSchema,
    EntitySelectEvent
  >

  // default message functions
  messageOptions: CvcEntitySelectMessageOptions2 = {
    loading: (searchStr) => {
      return `Searching ${this.cvcEntityName.plural}...`
    },
    empty: (searchStr, paramStr) => {
      if(paramStr && searchStr.length > 0) {
        return `No ${this.cvcEntityName.plural} found matching ${paramStr}, ${searchStr}`
      } else if (searchStr.length > 0){
        return `No ${this.cvcEntityName.plural} found matching query ${searchStr}`
      } else if (paramStr && searchStr.length === 0) {
        return `No ${this.cvcEntityName.plural} found that match ${paramStr}`
      } else {
        return `No ${this.cvcEntityName.plural} found.`
      }
    },
  }

  selectMessages!: { [key in CvcEntitySelectMessageMode]: string }

  constructor(
    private stateService: XstateAngular<
      EntitySelectContext,
      EntitySelectSchema,
      EntitySelectEvent
    >,
    private cdr: ChangeDetectorRef
  ) {
    this.onFocus$ = new Subject<void>()
    this.onOpenChange$ = new Subject<boolean>()
    this.onSearch$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.onLoading$ = new BehaviorSubject<boolean>(false)
    this.onOption$ = new Subject<NzSelectOptionInterface[]>()
    this.onResult$ = new Subject<any[]>()
    this.onMessageMode$ = new BehaviorSubject<
      Maybe<CvcEntitySelectMessageMode>
    >(undefined)
  }

  ngAfterViewInit(): void {
    // wrapping state creation in try/catch b/c it can fail silently while initializing
    try {
      this.state = this.stateService.useMachine(
        getEntitySelectMachine(this.onMessageMode$),
        {
          devTools: true,
        }
      )
    } catch (err) {
      console.error(err)
    }

    this.onOpenChange$
      .pipe(untilDestroyed(this))
      .subscribe((change: boolean) => {
        this.state.send({ type: change === true ? 'OPEN' : 'CLOSE' })
        this.cvcOnOpenChange.next(change)
      })

    this.onSearch$.pipe(untilDestroyed(this)).subscribe((str) => {
      if (typeof str === 'string') this.cvcOnSearch.next(str)
    })

    this.onResult$.pipe(untilDestroyed(this)).subscribe((results) => {
      if (results.length > 0) this.state.send({ type: 'SUCCESS' })
      if (results.length === 0) this.state.send({ type: 'FAIL' })
    })
  } // ngAfterViewInit()

  // attach some Inputs to Subjects for use in observable chains
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cvcLoading) {
      this.onLoading$.next(changes.cvcLoading.currentValue)
      // only send LOAD events if loading value is true
      if (changes.cvcLoading.currentValue) {
        this.state.send({
          type: 'LOAD',
        })
      }
    }
    if (changes.cvcOptions) {
      this.onOption$.next(changes.cvcOptions.currentValue)
    }
    if (changes.cvcResults) {
      this.onResult$.next(changes.cvcResults.currentValue)
    }
  }
  testRender(str: string) {
    console.log(`testRender: ${str}`)
  }
}
