import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChange,
  SimpleChanges,
  TemplateRef,
  TrackByFunction,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyAttributeEvent } from '@ngx-formly/core/lib/models'
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs'
import { combineLatestArray, combineLatestObject } from 'rxjs-etc'
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
  // template for extra content after entity tag in option row
  @Input() cvcOptionExtra: TemplateRef<any> | null = null
  // template containing UI to add an entity, display if no results returned from search
  @Input() cvcAddEntity: TemplateRef<any> | null = null
  @Output() readonly cvcOnSearch = new EventEmitter<string>()
  @Output() readonly cvcOnFocus = new EventEmitter<void>()

  // COMPONENT INPUT STREAMS
  // cvcResults - array of typeahead query results
  // cvcOnLoading - boolean of loading state

  // SOURCE STREAMS

  // INTERMEDIATE STREAMS

  // PRESENTATION STREAMS
  onFocus$: BehaviorSubject<void>
  onSearch$: BehaviorSubject<Maybe<string>>
  onResult$: BehaviorSubject<Maybe<any[]>>
  onLoading$: BehaviorSubject<boolean>

  focusMessage$: BehaviorSubject<Maybe<string>>
  notFoundMessage$: BehaviorSubject<Maybe<string>>
  loadingMessage$: BehaviorSubject<Maybe<string>>
  createMessage$: BehaviorSubject<Maybe<string>>

  constructor() {
    // create presentation streams
    this.onFocus$ = new BehaviorSubject<void>(void 0)
    this.onSearch$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.onResult$ = new BehaviorSubject<Maybe<any[]>>(undefined)
    this.onLoading$ = new BehaviorSubject<boolean>(false)

    this.loadingMessage$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.focusMessage$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.notFoundMessage$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.createMessage$ = new BehaviorSubject<Maybe<string>>(undefined)
  }
  // TODO: implement dropdown prompt Subject to handle the messages
  // - Enter at least {{ cvcSearchMinLength }} character{{cvcSearchMinLength > 1 ? 's' : ''}}
  // - No {{ cvcEntityName }} found that matches "{{ searchString }}"

  // onSearch(str: string) {
  //   // send search str if greater than or equal to specified min length
  //   if (str.length >= this.cvcSearchMinLength) {
  //     this.cvcOnSearch.next(str)
  //     this.notFoundPrompt$.next(
  //       `Enter at least ${this.cvcSearchMinLength} character ${
  //         this.cvcSearchMinLength > 1 ? 's' : ''
  //       } to search.`
  //     )
  //   }
  //   // clear results if search string less than min length and results exist
  //   if (
  //     str.length < this.cvcSearchMinLength &&
  //     this.cvcResults &&
  //     this.cvcResults.length > 0
  //   ) {
  //     console.log(
  //       `str < cvcSearchMinLength of ${this.cvcSearchMinLength}, clearing results.'`
  //     )
  //     // this.cvcResults = undefined
  //   }
  // }

  // getSearchPrompt(str: string): string {
  //   // if searchString.length < cvcSearchMinLength, return 'Enter at least...' prompt
  //   if (
  //     !this.cvcResults &&
  //     !this.cvcLoading &&
  //     str.length <= this.cvcSearchMinLength
  //   ) {
  //     // return
  //   }
  //   // if searchstring.length > cvcSearchMinLength, results exist, and
  //   // results.length === 0, return 'No entity found...' prompt
  // }

  // form fields do all their config in AfterViewInit
  ngAfterViewInit(): void {
    // emit search queries
    this.onSearch$.pipe(untilDestroyed(this)).subscribe((s) => {
      if (s !== undefined) this.cvcOnSearch.next(s)
    })

    // set messages
    combineLatest([this.onFocus$, this.onSearch$, this.onLoading$])
      .pipe(tag(`${this.cvcFormlyAttributes.id} combineLatest prompt txt`))
      .subscribe(([_focus, search, loading]) => {
        // if not loading and results exist, show no status messages, return
        if (!loading && this.cvcResults && this.cvcResults.length > 0) {
          this.focusMessage$.next(undefined)
          this.loadingMessage$.next(undefined)
          this.notFoundMessage$.next(undefined)
          this.createMessage$.next(undefined)
        }

        // select focused, no search string entered, no results
        // show search prompt msg, e.g. "Enter search query"
        //
        // NOTE: This will only be useful if we need to implement a
        // minimum search query length feature, by replacing below all
        // instances of 'search.length > 0' for 'search.length >= minSearchLength'
        // (and implementing logic to prevent lengths < minSearchLength from being emitted)
        if (
          !loading &&
          !this.cvcResults &&
          search !== undefined &&
          search.length > 0
        ) {
          this.focusMessage$.next(this.cvcSelectMessages.focus)
          this.loadingMessage$.next(undefined)
          this.notFoundMessage$.next(undefined)
          this.createMessage$.next(undefined)
        }
        // loading results,
        // show loading message, e.g. "Search for Entities..."
        if (
          loading &&
          (!search || (search !== undefined && search.length === 0))
        ) {
          this.loadingMessage$.next(this.cvcSelectMessages.loading)
          this.focusMessage$.next(undefined)
          this.notFoundMessage$.next(undefined)
          this.createMessage$.next(undefined)
        }
        // search performed, no results exist
        // show not found message, e.g. "No Entities found"
        if (
          !loading &&
          search !== undefined &&
          search.length > 0 &&
          this.cvcResults &&
          this.cvcResults.length === 0
        ) {
          const msg = this.cvcSelectMessages.notfound.replace(
            'SEARCH_STRING',
            search
          )
          this.notFoundMessage$.next(msg)
          this.loadingMessage$.next(undefined)
          this.focusMessage$.next(undefined)
          this.createMessage$.next(undefined)
        }
        // search performed, no results exist
        // show not found message, e.g. "No Entities found"
        if (
          !loading &&
          search !== undefined &&
          search.length > 0 &&
          this.cvcResults &&
          this.cvcResults.length === 0
        ) {
          const msg = this.cvcSelectMessages.notfound.replace(
            'SEARCH_STRING',
            search
          )
          this.notFoundMessage$.next(msg)
          this.loadingMessage$.next(undefined)
          this.focusMessage$.next(undefined)
          this.createMessage$.next(undefined)
        }
      })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cvcLoading) {
      this.onLoading$.next(changes.cvcLoading.currentValue)
    }
  }
}
