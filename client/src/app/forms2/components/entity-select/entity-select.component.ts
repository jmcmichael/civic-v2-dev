import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
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

export type CvcSelectMessageOptions = {
  // a prompt to click and search, e.g. 'Search Entities'
  initial: string
  // displayed after click or select, helptext indicating
  // the the field(s) searched, e.g. 'Searches Gene names and aliases'
  focus: string
  // displayed beneath select input, while server request is loading,
  // e.g. 'Loading Entities...'
  searching: string
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
export class CvcEntitySelectComponent implements AfterViewInit {
  @Input() cvcFormControl!: FormControl
  @Input() cvcFormlyAttributes!: FormlyFieldConfig
  @Input() cvcEntityName: { singular: string; plural: string } = {
    singular: 'Entity',
    plural: 'Entities',
  }
  @Input() cvcShowError: boolean = false
  @Input() cvcDisabled?: boolean = false
  @Input() cvcAllowClear: boolean = true
  @Input() cvcLoading!: Observable<boolean>
  @Input() cvcResults!: Observable<Maybe<any[]>>
  @Input() cvcNotFound: string | TemplateRef<any> | undefined = undefined
  @Input() cvcOptionExtra: TemplateRef<any> | null = null
  @Input() cvcSearchMinLength: number = 1
  @Input() cvcOptionTrackBy!: TrackByFunction<any>
  @Input() cvcModelChange?: FormlyAttributeEvent

  @Output() readonly cvcOnSearch = new EventEmitter<string>()
  @Output() readonly cvcOnFocus = new EventEmitter<void>()
  @Input() cvcSelectMessages: CvcSelectMessageOptions = {
    initial: 'Search Entities',
    focus: 'Query matches Entity names',
    searching: 'Searching Entities',
    notfound: 'No Entities found matching "SEARCH_STRING"',
    create: 'Create a new Entity named "SEARCH_STRING"?',
  }

  // COMPONENT INPUT STREAMS
  // cvcResults - array of typeahead query results
  // cvcOnLoading - boolean of loading state
  placeholder$: BehaviorSubject<string>
  // SOURCE STREAMS
  onSearch$: BehaviorSubject<Maybe<string>>

  // INTERMEDIATE STREAMS

  // PRESENTATION STREAMS
  notFoundPrompt$: BehaviorSubject<Maybe<string>>
  enterSearchPrompt$: BehaviorSubject<Maybe<string>>

  constructor() {
    this.placeholder$ = new BehaviorSubject<string>(
      this.cvcSelectMessages.initial
    )
    this.onSearch$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.enterSearchPrompt$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.notFoundPrompt$ = new BehaviorSubject<Maybe<string>>(
      'Enter a search query string.'
    )
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

  ngAfterViewInit(): void {
    if (!this.cvcEntityName) {
      console.error(
        `${this.cvcFormlyAttributes.id} entity-select's cvcEntityName input requires valid string, none provided.`
      )
      return
    }
    if (!this.cvcEntityName) {
      console.error(
        `${this.cvcFormlyAttributes.id} entity-select's cvcEntityName input requires valid string, none provided.`
      )
      return
    }
    if (!this.cvcResults) {
      console.error(
        `${this.cvcFormlyAttributes.id} entity-select's cvcResults input requires valid Observable<Maybe<any[]>>, none provided.`
      )
      return
    }
    if (!this.cvcLoading) {
      console.error(
        `${this.cvcFormlyAttributes.id} entity-select's cvcLoading input requires valid Observable<boolean>, none provided.`
      )
      return
    }
    this.placeholder$.next(this.cvcSelectMessages.initial)
    combineLatest([
      this.onSearch$,
      this.cvcResults,
      this.cvcLoading,
      of(this.cvcSearchMinLength),
    ]).pipe(tag(`${this.cvcFormlyAttributes.id} combineLatest prompt txt`))
  }
}
