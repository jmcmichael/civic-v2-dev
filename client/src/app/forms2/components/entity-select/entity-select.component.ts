import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { ApolloQueryResult } from '@apollo/client/core'
import {
  GeneSelectGQL,
  GeneSelectQuery,
  GeneSelectQueryVariables,
} from '@app/generated/civic.apollo'
import { UntilDestroy } from '@ngneat/until-destroy'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { Query, QueryRef } from 'apollo-angular'
import {
  asyncScheduler,
  Observable,
  Subject,
  switchMap,
  throttleTime,
} from 'rxjs'
import { EntitySelectOptionItem } from './entity-select-option/entity-select-option.component'

@UntilDestroy()
@Component({
  selector: 'cvc-entity-select',
  templateUrl: './entity-select.component.html',
  styleUrls: ['./entity-select.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcEntitySelectComponent<Q extends { __typename: 'Query' }, V extends any, F extends { __typename: string }, GQL extends Query<Q, V>>
  implements AfterViewInit
{
  @Input() cvcFormControl!: FormControl
  @Input() cvcFormlyAttributes!: FormlyFieldConfig
  @Input() cvcSelectQuery!: GQL
  @Input() cvcPlaceholder: string = 'Select an option'
  @Input() cvcShowError: boolean = false
  @Input() cvcDisabled: boolean = false
  @Input() cvcAllowClear: boolean = true
  @Input() cvcSelectOptionExtra: TemplateRef<any> | null = null

  // SOURCE STREAMS
  onFocus$: Subject<boolean>
  onSearch$: Subject<string>

  // INTERMEDIATE STREAMS
  response$!: Observable<ApolloQueryResult<any>>

  // PRESENTATION STREAMS
  isLoading$!: Observable<boolean>
  result$!: Observable<EntitySelectOptionItem[]>

  queryRef!: QueryRef<any, any> // gql query reference

  constructor() {
    this.onSearch$ = new Subject<string>()
    this.onFocus$ = new Subject<boolean>()
  }

  ngAfterViewInit(): void {
    if (!this.cvcSelectQuery) {
      console.error(
        `entity-select.component cvcSelectQuery requires valid Query<any, any> Input`
      )
      return
    }

    // set up typeahead watch & fetch calls
    this.response$ = this.onSearch$.pipe(
      // skip(1), // drop empty string from initial field focus
      // wait 1/3sec after typing activity stops to query server
      // quash leading event, emit trailing event so we only get 1 search string
      throttleTime(300, asyncScheduler, { leading: false, trailing: true }),
      switchMap((str: string) => {
        const query: V = { entrezSymbol: str }
        // helper functions for iif operator:
        const watchQuery = (query: GeneInputTypeaheadQueryVariables) => {
          // returns observable from initial watch() query
          this.queryRef = this.typeaheadGQL.watch(query)
          return this.queryRef.valueChanges
        }
        const fetchQuery = (query: GeneInputTypeaheadQueryVariables) => {
          // returns observable from refetch() promise
          return from(this.queryRef.refetch(query))
        }

        // this iif operator prevents double-calling the API:
        // if queryRef doesn't exist, create it with watchQuery observable
        // if it does, refetch with fetchQuery observable.
        // using defer() ensures functions are not called until
        // values are emitted. otherwise they'll be called on subscribe.
        return iif(
          () => this.queryRef === undefined, // predicate
          defer(() => watchQuery(query)), // true
          defer(() => fetchQuery(query)) // false
        )
      })
      // tag('gene-input response$')
    ) // end this.response$
  }
}
