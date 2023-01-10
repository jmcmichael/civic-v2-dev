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
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  Observable,
  Subject,
} from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { pluck } from 'rxjs-etc/operators'
import { State } from 'xstate'
import { InterpretedService, XstateAngular } from 'xstate-angular'
import {
  EntitySelectContext,
  EntitySelectEvent,
  EntitySelectMessageOptions,
  EntitySelectSchema,
  getEntitySelectMachine,
} from './entity-select.xstate'

export type CvcSelectEntityName = { singular: string; plural: string }

export type CvcEntitySelectMessageMode =
  | 'idle'
  | 'open'
  | 'loading'
  | 'empty'
  | 'query'

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
  @Input() cvcSelectMessages?: EntitySelectMessageOptions
  @Input() cvcSelectMode: 'multiple' | 'tags' | 'default' = 'default'
  @Input() cvcPlaceholder?: string
  @Input() cvcLoading?: boolean = false
  @Input() cvcOptions?: NzSelectOptionInterface[]
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

  // name of entity specified by optional param value, for constructing messages
  @Input() cvcParamName?: string

  // templateref w/ entity's quick-add form component
  @Input() cvcAddEntity: TemplateRef<any> | null = null

  // model update callback fn - ngx-formly convention, implements props.change feature
  @Input() cvcModelChange?: FormlyAttributeEvent

  @Output() readonly cvcOnSearch = new EventEmitter<string>()

  // SOURCE STREAMS
  onOpenChange$: Subject<boolean>
  onSearch$: BehaviorSubject<Maybe<string>>
  onParamName$: BehaviorSubject<Maybe<string>>
  onSearchMessage$: Observable<Maybe<string>>

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

  state$!: Observable<
    State<EntitySelectContext, EntitySelectEvent, EntitySelectSchema>
  >

  messageOptions: EntitySelectMessageOptions = {
    search: (entityName, query, _paramName) =>
      `Searching ${entityName} matching "${query}""...`,
    searchParam: (entityName, query, paramName) =>
      `Searching ${paramName} ${entityName} matching "${query}""...`,
    searchParamAll: (entityName, _query, paramName) =>
      `Listing all ${paramName} ${entityName}...`,
    empty: (entityName, query) => `No ${entityName} found matching "${query}"`,
    emptyParam: (entityName, query, paramName) =>
      `No ${paramName} ${entityName} found matching "${query}"`,
    emptyParamAll: (entityName, _query, paramName) =>
      `No ${paramName} ${entityName} found`,
  }

  constructor(
    private stateService: XstateAngular<
      EntitySelectContext,
      EntitySelectSchema,
      EntitySelectEvent
    >,
    private cdr: ChangeDetectorRef
  ) {
    this.onOpenChange$ = new Subject<boolean>()
    this.onSearch$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.onLoading$ = new BehaviorSubject<boolean>(false)
    this.onOption$ = new Subject<NzSelectOptionInterface[]>()
    this.onParamName$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.onResult$ = new Subject<any[]>()
    this.onSearchMessage$ = new Subject<Maybe<string>>()
  }

  ngAfterViewInit(): void {
    try {
      this.state = this.stateService.useMachine(
        getEntitySelectMachine({
          entityName: this.cvcEntityName,
          messageOptions: this.messageOptions,
        }),
        {
          devTools: true,
        }
      )
      this.state$ = this.state.state$
    } catch (err) {
      console.error(err)
    }

    // DEBUG
    this.state$.pipe(untilDestroyed(this)).subscribe((state) => {
      // if (this.cvcEntityName.singular !== 'Variant') return
      // console.log(state)
      console.log(state.event)
      console.log(
        `******* value: ${state.value ? JSON.stringify(state.value) : 'none'}`
      )
    })
    // SEND STATE EVENTS FROM TEMPLATE NZ-SELECT
    this.onOpenChange$
      .pipe(untilDestroyed(this))
      .subscribe((change: boolean) => {
        this.state.send({ type: change === true ? 'OPEN' : 'CLOSE' })
      })

    this.onSearch$
      .pipe(untilDestroyed(this))
      .subscribe((str: Maybe<string>) => {
        if (typeof str === 'string') {
          this.state.send({
            type: 'SEARCH',
            query: str,
            paramName: this.onParamName$.value,
          })
        }
      })

    // EMIT COMPONENT OUTPUT EVENTS FROM STATE EVENTS
    this.state$
      .pipe(pluck('event'), untilDestroyed(this))
      .subscribe((event: EntitySelectEvent) => {
        switch (event.type) {
          case 'SEARCH':
            this.cvcOnSearch.next(event.query)
            break
        }
      })

    // OBSERVE STATE SEARCH, EMPTY, ERROR MESSAGES
    this.onSearchMessage$ = this.state$.pipe(
      pluck('context', 'message'),
      filter(isNonNulled),
      distinctUntilChanged()
    )
  } // ngAfterViewInit()

  ngOnChanges(changes: SimpleChanges): void {
    /* SEND STATE EVENTS FROM @Inputs */
    if (changes.cvcLoading) {
      this.onLoading$.next(changes.cvcLoading.currentValue)
      // only send LOAD events if loading value is true
      if (changes.cvcLoading.currentValue) {
        this.state.send({
          type: 'LOAD',
          isLoading: changes.cvcLoading.currentValue,
        })
      }
    }
    if (changes.cvcOptions) {
      const options = changes.cvcOptions.currentValue
      if (options.length > 0) {
        this.state.send({
          type: 'SUCCESS',
          options: options,
        })
      }
    }
    if (changes.cvcResults) {
      const results = changes.cvcResults.currentValue
      if (results.length === 0) {
        this.state.send({ type: 'FAIL' })
      }
      this.onResult$.next(changes.cvcResults.currentValue)
    }
    if (changes.cvcParamName) {
      this.onParamName$.next(changes.cvcParamName.currentValue)
    }
  }
}
