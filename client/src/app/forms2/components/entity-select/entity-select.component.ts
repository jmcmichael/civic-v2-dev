import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
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
import { BehaviorSubject, combineLatest, Subject } from 'rxjs'
import { pluck } from 'rxjs-etc/operators'
import { tag } from 'rxjs-spy/operators'
import { InterpretedService, XstateAngular } from 'xstate-angular'

import {
  EntitySelectStateContext,
  EntitySelectStateEvent,
  EntitySelectStateSchema,
  getEntitySelectStateMachine,
} from './entity-select.state'

export type CvcSelectEntityName = { singular: string; plural: string }
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

@UntilDestroy()
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
  @Input() cvcOptions?: NzSelectOptionInterface[] = []
  // search results, provided by EntityTagFieldMixin's result$ (or other search results observable)
  @Input() cvcResults?: any[]
  @Input() cvcShowError: boolean = false
  @Input() cvcDisabled?: boolean = false
  @Input() cvcAllowClear: boolean = false
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

  // SOURCE STREAMS
  onFocus$: Subject<void>
  onBlur$: Subject<void>
  onSearch$: BehaviorSubject<Maybe<string>>

  // INTERMEDIATE STREAMS

  // PRESENTATION STREAMS
  onResult$: BehaviorSubject<Maybe<any[]>>
  onLoading$: BehaviorSubject<boolean>
  onOption$: Subject<NzSelectOptionInterface[]>

  // UI message streams
  focusMessage$: BehaviorSubject<Maybe<string>>
  loadingMessage$: BehaviorSubject<Maybe<string>>
  notFoundMessage$: BehaviorSubject<Maybe<string>>
  notFoundWithParamMessage$: BehaviorSubject<Maybe<string>>
  createMessage$: BehaviorSubject<Maybe<string>>

  state!: InterpretedService<
    EntitySelectStateContext,
    EntitySelectStateSchema,
    EntitySelectStateEvent
  >

  constructor(
    private stateService: XstateAngular<
      EntitySelectStateContext,
      EntitySelectStateSchema,
      EntitySelectStateEvent
    >,
    private cdr: ChangeDetectorRef
  ) {
    // create streams
    this.onFocus$ = new Subject<void>()
    this.onBlur$ = new Subject<void>()
    this.onSearch$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.onResult$ = new BehaviorSubject<Maybe<any[]>>(undefined)
    this.onLoading$ = new BehaviorSubject<boolean>(false)
    this.onOption$ = new Subject<NzSelectOptionInterface[]>()

    this.loadingMessage$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.focusMessage$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.notFoundMessage$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.notFoundWithParamMessage$ = new BehaviorSubject<Maybe<string>>(
      undefined
    )
    this.createMessage$ = new BehaviorSubject<Maybe<string>>(undefined)

    const selectStateConfig: EntitySelectStateSchema = {
      states: {
        idle: {
          on: {
            FOCUS: { target: 'focus' },
          },
        },
        focus: {
          on: {
            SEARCH: { target: 'search' },
            BLUR: { target: 'blur' },
          },
        },
        search: {
          on: {
            LOAD: { target: 'load' },
          },
        },
        load: {
          on: {
            OPTIONS: { target: 'options' },
            ERROR: { target: 'error' },
          },
        },
        options: {
          on: {
            ADD: { target: 'added' },
            SELECT: { target: 'selected' },
          },
        },
        selected: {},
        added: {},
        blur: {},
        error: {},
      },
    }

    try {
      this.state = this.stateService.useMachine(
        getEntitySelectStateMachine(selectStateConfig),
        {
          devTools: true,
        }
      )
    } catch (err) {
      console.log(err)
    }

    // hook up state to event streams
    this.onFocus$.pipe(untilDestroyed(this)).subscribe((_) => {
      this.state.send({ type: 'FOCUS' })
    })
    this.onBlur$.pipe(untilDestroyed(this)).subscribe((_) => {
      this.state.send({ type: 'BLUR' })
    })
    this.onSearch$.pipe(untilDestroyed(this)).subscribe((searchString) => {
      if (searchString !== undefined)
        this.state.send({ type: 'SEARCH', value: searchString })
    })
    this.onLoading$.pipe(untilDestroyed(this)).subscribe((isLoading) => {
      this.state.send({ type: 'LOAD', value: isLoading })
    })
    this.onOption$.pipe(untilDestroyed(this)).subscribe((options) => {
      this.state.send({ type: 'OPTIONS', value: options })
    })

    try {
      this.state.state$
        .pipe(
          // pluck(),
          untilDestroyed(this)
        )
        .subscribe((e) => console.log(e))
    } catch (err) {
      console.log(err)
    }
  }

  ngAfterViewInit(): void {
    this.onFocus$.pipe(untilDestroyed(this)).subscribe((_) => {
      this.state.send({ type: 'FOCUS' })
      this.cvcOnFocus.next()
    })
    this.onBlur$.pipe(untilDestroyed(this)).subscribe((_) => {
      this.state.send({ type: 'BLUR' })
      this.cvcOnBlur.next()
    })
    // emit search queries
    this.onSearch$.pipe(untilDestroyed(this)).subscribe((s) => {
      if (s !== undefined) this.cvcOnSearch.next(s)
      if (s !== undefined) this.state.send({ type: 'SEARCH', value: s })
    })

    //
    // SELECT MSG HELPER FUNCTIONS
    // roughly in the order of their occurence interacting w/ the select
    //

    // select focused, no search string entered, no results
    // NOTE: This will only be useful if we need to implement a
    // minimum search query length feature, by replacing in all msg fn
    // instances the comparator 'search.length > 0' for 'search.length >= minSearchLength'
    // (and implementing logic to prevent lengths < minSearchLength from being emitted)
    // NOTE: all this would probably be more elegantly implemented as a state machine?
    function inputHasFocus(
      loading: boolean,
      search: Maybe<string>,
      results: Maybe<any[]>
    ): boolean {
      return !loading && !results && search !== undefined && search.length > 0
    }

    // search string does not exist or is > 0 length, loading true
    function isLoading(loading: boolean, search: Maybe<string>): boolean {
      return (
        loading && (!search || (search !== undefined && search.length === 0))
      )
    }

    // if not loading and results exist
    function resultsExist(loading: boolean, results: Maybe<any[]>) {
      return !loading && results && results.length > 0
    }

    // if not loading, search string exists, results exist with 0 length
    function noResultsExist(
      loading: boolean,
      search: Maybe<string>,
      results: Maybe<any[]>
    ): boolean {
      return (
        !loading &&
        search !== undefined &&
        search.length > 0 &&
        results !== undefined &&
        results.length === 0
      )
    }

    // show "no records found for string STR and ${entitySchemaType} ${paramValue} if not loading, no search string, results exist with 0 length,
    // and param provided
    function noResultsExistWithParam(
      loading: boolean,
      search: Maybe<string>,
      results: Maybe<any[]>,
      param: Maybe<any>
    ): boolean {
      return noResultsExist(loading, search, results) && param
    }

    function noResultsCreateEntity(
      loading: boolean,
      search: Maybe<string>,
      results: Maybe<any[]>,
      addTpl: Maybe<TemplateRef<any> | null>
    ): boolean {
      return noResultsExist(loading, search, results) && addTpl !== null
    }

    // set messages
    // combineLatest([this.onFocus$, this.onSearch$, this.onLoading$, this.typeaheadParam$])
    combineLatest([this.onFocus$, this.onSearch$, this.onLoading$])
      .pipe(untilDestroyed(this))
      .subscribe(([_focus, search, loading]) => {
        // show search prompt msg, e.g. "Enter search query"
        if (inputHasFocus(loading, search, this.cvcResults)) {
          const msg =
            this.cvcSelectMessages?.focus ||
            `Enter query to search ENTITY_NAME_PLURAL`
          this.focusMessage$.next(
            msg.replace('ENTITY_NAME_PLURAL', this.cvcEntityName.plural)
          )
          this.loadingMessage$.next(undefined)
          this.notFoundMessage$.next(undefined)
          this.createMessage$.next(undefined)
        }

        // show no select messages
        if (resultsExist(loading, this.cvcResults)) {
          this.focusMessage$.next(undefined)
          this.loadingMessage$.next(undefined)
          this.notFoundMessage$.next(undefined)
          this.createMessage$.next(undefined)
        }

        // show loading message, e.g. "Search for Entities..."
        if (isLoading(loading, search)) {
          const msg =
            this.cvcSelectMessages?.loading || `Searching ENTITY_NAME_PLURAL…`
          this.loadingMessage$.next(
            msg.replace('ENTITY_NAME_PLURAL', this.cvcEntityName.plural)
          )
          this.focusMessage$.next(undefined)
          this.notFoundMessage$.next(undefined)
          this.createMessage$.next(undefined)
        }

        // show not found message, e.g. "No Entities found"
        if (noResultsExist(loading, search, this.cvcResults)) {
          if (!search) return
          const notFound =
            this.cvcSelectMessages?.notfound ||
            `No ENTITY_NAME_PLURAL found matching "SEARCH_STRING".`
          const msg = notFound
            .replace('SEARCH_STRING', search)
            .replace('ENTITY_NAME_PLURAL', this.cvcEntityName.plural)
          this.notFoundMessage$.next(msg)
          this.loadingMessage$.next(undefined)
          this.focusMessage$.next(undefined)
          this.createMessage$.next(undefined)
        }

        // no results exist, cvcAddEntity template exists
        // search performed, no results exist
        // show not found message, e.g. "No Entities found"
        if (
          noResultsCreateEntity(
            loading,
            search,
            this.cvcResults,
            this.cvcAddEntity
          )
        ) {
          if (!search) return
          const create =
            this.cvcSelectMessages?.create ||
            `Create a new ENTITY_NAME_SINGULAR named "SEARCH_STRING"?'`
          const msg = create
            .replace('SEARCH_STRING', search)
            .replace('ENTITY_NAME_SINGULAR', this.cvcEntityName.singular)
          this.notFoundMessage$.next(undefined)
          this.loadingMessage$.next(undefined)
          this.focusMessage$.next(undefined)
          this.createMessage$.next(msg)
        }
      }) // combineLatest.subscribe()
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
