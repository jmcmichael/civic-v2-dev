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
import { InterpretedService, XstateAngular } from 'xstate-angular'
import {
  EntitySelectContext,
  EntitySelectEvent,
  EntitySelectSchema,
  getEntitySelectMachine,
} from './entity-select.xstate'

export type CvcSelectEntityName = { singular: string; plural: string }

export type CvcEntitySelectParamMsgFn = {
  description: string
  (strings: string[], search: string, param: string): string
}

/* FIELD MESSAGES - various messages displayed by the field
 *  - prompt (below field): if disabled, hints to user how to enable field, e.g. "Select a Gene to search Variants."
 * - loading (inside dropdown): while API requests loading, e.g. "Loading Variants..."
 * - empty: (inside dropdown): if no results returned, e.g. "No BRAF Variants found matching V600000"
 *   NOTE: if cvcCreateEntity provided, its quick-add form will be displayed instead, which will include its own prompt, e.g. "No BRAF Variants found matching V60000, would you like to create it?"
 * */
export type CvcEntitySelectMessageOptions2 = Partial<{
  prompt: string | CvcEntitySelectParamMsgFn
  loading: string | CvcEntitySelectParamMsgFn
  empty: string | CvcEntitySelectParamMsgFn
}>

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
  onBlur$: Subject<void>
  onSearch$: BehaviorSubject<Maybe<string>>

  // INTERMEDIATE STREAMS

  // PRESENTATION STREAMS
  onResult$: BehaviorSubject<Maybe<any[]>>
  onLoading$: BehaviorSubject<boolean>
  onOption$: Subject<NzSelectOptionInterface[]>

  state!: InterpretedService<
    EntitySelectContext,
    EntitySelectSchema,
    EntitySelectEvent
  >
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
    this.onBlur$ = new Subject<void>()
    this.onSearch$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.onResult$ = new BehaviorSubject<Maybe<any[]>>(undefined)
    this.onLoading$ = new BehaviorSubject<boolean>(false)
    this.onOption$ = new Subject<NzSelectOptionInterface[]>()
  }

  ngAfterViewInit(): void {
    try {
      this.state = this.stateService.useMachine(getEntitySelectMachine(), {
        devTools: true,
      })
    } catch (err) {
      console.log(err)
    }

    try {
      this.state.state$
        .pipe(
          // pluck(),
          untilDestroyed(this)
        )
        .subscribe((e) => console.log(e.value))
    } catch (err) {
      console.log(err)
    }

    // hook up Outputs and state Events
    this.onFocus$.pipe(untilDestroyed(this)).subscribe((_) => {
      this.cvcOnFocus.next()
      this.state.send({ type: 'FOCUS' })
    })
    this.onBlur$.pipe(untilDestroyed(this)).subscribe((_) => {
      this.cvcOnBlur.next()
    })
    this.onOpenChange$
      .pipe(untilDestroyed(this))
      .subscribe((change: boolean) => {
        this.cvcOnOpenChange.next(change)
        this.state.send({ type: change === true ? 'OPEN' : 'CLOSE' })
      })
    this.onSearch$.pipe(untilDestroyed(this)).subscribe((str) => {
      if (str) {
        this.cvcOnSearch.next(str)
        this.state.send({ type: 'SEARCH', searchStr: str })
      }
    })
  } // ngAfterViewInit()

  // attach some Inputs to Subjects for use in observable chains
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cvcLoading) {
      this.onLoading$.next(changes.cvcLoading.currentValue)
    }
    if (changes.cvcOptions) {
      this.onOption$.next(changes.cvcOptions.currentValue)
    }
  }
}
