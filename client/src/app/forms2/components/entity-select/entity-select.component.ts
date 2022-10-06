import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  TrackByFunction,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyAttributeEvent } from '@ngx-formly/core/lib/models'
import { BehaviorSubject, combineLatest, Subject } from 'rxjs'
import { tag } from 'rxjs-spy/operators'

export type CvcSelectEntityName = { singular: string; plural: string }
export type CvcSelectMessageOptions = {
  // displayed after click or select, helptext indicating
  // the the field(s) searched, e.g. 'Searches Gene names and aliases'
  focus: string
  // displayed beneath select input, while server request is loading,
  // e.g. 'Loading Entities...'
  loading: string
  // displayed if no records match search string, SEARCH_STRING is
  // replaced with onSearch$ string
  // e.g. 'No Entities found matching "SEARCH_STRING"'
  notfound: string
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
  // these select messages are displayed in the input area
  // or the NotFound template area under the input after
  // the field obtains focus
  @Input() cvcSelectMessages: CvcSelectMessageOptions = {
    // displayed under input, after focus, before any search query entered
    focus: 'Enter search query',
    // displayed while API requests complete
    loading: 'Searching Entities',
    // displayed if research results empty
    notfound: 'No Entities found matching "SEARCH_STRING"',
    // displayed if search results empty and select has been provided cvcAddEntity template
    create: 'Create a new Entity named "SEARCH_STRING"?',
  }
  @Input() cvcPlaceholder: string = `Search ${this.cvcEntityName.plural}`
  @Input() cvcLoading?: boolean = false
  @Input() cvcResults?: any[]
  @Input() cvcShowError: boolean = false
  @Input() cvcDisabled?: boolean = false
  @Input() cvcAllowClear: boolean = true
  @Input() cvcOptionTrackBy?: TrackByFunction<any>
  @Input() cvcModelChange?: FormlyAttributeEvent
  @Input() cvcSelectMode: 'multiple' | 'tags' | 'default' = 'default'
  // custom template for field value render
  @Input() cvcCustomTemplate?: TemplateRef<any> | null = null
  // template for extra content after entity tag in option row
  @Input() cvcOptionExtra: TemplateRef<any> | null = null
  // template containing UI to add an entity, display if no results returned from search
  @Input() cvcAddEntity: TemplateRef<any> | null = null
  @Input() cvcOnCreate?: Subject<number>
  @Output() readonly cvcOnSearch = new EventEmitter<string>()
  @Output() readonly cvcOnFocus = new EventEmitter<void>()

  // SOURCE STREAMS
  onFocus$: BehaviorSubject<void>
  onSearch$: BehaviorSubject<Maybe<string>>

  // INTERMEDIATE STREAMS

  // PRESENTATION STREAMS
  onResult$: BehaviorSubject<Maybe<any[]>>
  onLoading$: BehaviorSubject<boolean>

  // UI message streams
  focusMessage$: BehaviorSubject<Maybe<string>>
  notFoundMessage$: BehaviorSubject<Maybe<string>>
  loadingMessage$: BehaviorSubject<Maybe<string>>
  createMessage$: BehaviorSubject<Maybe<string>>

  constructor() {
    // create streams
    this.onFocus$ = new BehaviorSubject<void>(void 0)
    this.onSearch$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.onResult$ = new BehaviorSubject<Maybe<any[]>>(undefined)
    this.onLoading$ = new BehaviorSubject<boolean>(false)

    this.loadingMessage$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.focusMessage$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.notFoundMessage$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.createMessage$ = new BehaviorSubject<Maybe<string>>(undefined)
  }

  // formly fields do all their config in AfterViewInit, so components with
  // FormControl or FormConfig Inputs need to do all their config in AfterViewInit, too
  ngAfterViewInit(): void {
    // emit search queries
    this.onSearch$.pipe(untilDestroyed(this)).subscribe((s) => {
      if (s !== undefined) this.cvcOnSearch.next(s)
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

    function noResultsCreateEntity(
      loading: boolean,
      search: Maybe<string>,
      results: Maybe<any[]>,
      addTpl: Maybe<TemplateRef<any> | null>
    ): boolean {
      return noResultsExist(loading, search, results) && addTpl !== null
    }

    // set messages
    combineLatest([this.onFocus$, this.onSearch$, this.onLoading$])
      // .pipe(tag(`${this.cvcFormlyAttributes.id} combineLatest prompt txt`))
      .subscribe(([_focus, search, loading]) => {
        // show search prompt msg, e.g. "Enter search query"
        if (inputHasFocus(loading, search, this.cvcResults)) {
          this.focusMessage$.next(this.cvcSelectMessages.focus)
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
          this.loadingMessage$.next(this.cvcSelectMessages.loading)
          this.focusMessage$.next(undefined)
          this.notFoundMessage$.next(undefined)
          this.createMessage$.next(undefined)
        }

        // show not found message, e.g. "No Entities found"
        if (noResultsExist(loading, search, this.cvcResults)) {
          if (!search) return
          const msg = this.cvcSelectMessages.notfound.replace(
            'SEARCH_STRING',
            search
          )
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
          const msg = this.cvcSelectMessages.create.replace(
            'SEARCH_STRING',
            search
          )
          this.notFoundMessage$.next(undefined)
          this.loadingMessage$.next(undefined)
          this.focusMessage$.next(undefined)
          this.createMessage$.next(msg)
        }

      }) // combineLatest.subscribe()
  }

  // attach some Inputs to Subjects for use in observable chains
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cvcLoading) {
      this.onLoading$.next(changes.cvcLoading.currentValue)
    }
  }
}
