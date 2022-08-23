import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Type,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import {
  LinkableVariant,
  Maybe,
  VariantInputTypeaheadGQL,
  VariantInputTypeaheadQuery,
  VariantInputTypeaheadQueryVariables,
  VariantInputTypeaheadFieldsFragment,
} from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { QueryRef } from 'apollo-angular'
import {
  asyncScheduler,
  defer,
  distinctUntilChanged,
  map,
  filter,
  from,
  iif,
  Observable,
  skip,
  Subject,
  switchMap,
  throttleTime,
  withLatestFrom,
} from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { pluck } from 'rxjs-etc/operators'
import { tag } from 'rxjs-spy/operators'

interface CvcVariantInputFieldProps extends FormlyFieldProps {
  placeholder: string
  selectGeneMessage: string
}

export interface CvcVariantInputFieldConfig
  extends FormlyFieldConfig<CvcVariantInputFieldProps> {
  type: 'variant-input' | Type<CvcVariantInputField>
}
@UntilDestroy()
@Component({
  selector: 'cvc-variant-input',
  templateUrl: './variant-input.type.html',
  styleUrls: ['./variant-input.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcVariantInputField
  extends FieldType<FieldTypeConfig<CvcVariantInputFieldProps>>
  implements AfterViewInit
{
  // store linkable entity for tag display
  tag: Maybe<LinkableVariant>

  // field interactions
  state: Maybe<EvidenceState>
  geneId$!: Subject<Maybe<number>>

  // SOURCE STREAMS
  onSearch$: Subject<string>
  onSelect$: Subject<void>
  queryRef!: QueryRef<
    VariantInputTypeaheadQuery,
    VariantInputTypeaheadQueryVariables
  >

  // INTERMEDIATE STREAMS
  response$!: Observable<ApolloQueryResult<VariantInputTypeaheadQuery>>
  result$!: Observable<VariantInputTypeaheadFieldsFragment[]>
  isLoading$!: Observable<boolean>

  onSearch = (str: string) => {
    console.log(str)
  }
  constructor(private gql: VariantInputTypeaheadGQL) {
    super()
    this.onSearch$ = new Subject<string>()
    this.onSelect$ = new Subject<void>()
  }

  ngAfterViewInit(): void {
    // find and assign geneId on formState.fields
    if (this.field.options?.formState) {
      this.state = this.field.options.formState
      if (this.state && this.state.fields.geneId$) {
        this.geneId$ = this.state.fields.geneId$
        this.geneId$
          .pipe(tag('variant-input fields.geneId$'), untilDestroyed(this))
          .subscribe()
      } else {
        console.error(
          `variant-input field could not find a geneId$ subject in formState fields.`
        )
      }
    }
    // set up typeahead watch, fetch calls
    // set up typeahead watch, fetch calls
    this.response$ = this.onSearch$.pipe(
      skip(1), // drop empty string from initial field focus
      // wait 1/3sec after typing activity stops to query server
      // quash leading event, emit trailing event so we only get 1 search string
      throttleTime(300, asyncScheduler, { leading: false, trailing: true }),
      // tag('variant-input response$'),
      switchMap((str: string) => {
        const query: VariantInputTypeaheadQueryVariables = { name: str, geneId: undefined}
        // helper functions for iif operator:
        const watchQuery = (query: VariantInputTypeaheadQueryVariables) => {
          // returns observable from initial watch() query
          this.queryRef = this.gql.watch(query)
          return this.queryRef.valueChanges
        }
        const fetchQuery = (query: VariantInputTypeaheadQueryVariables) => {
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
    ) // end this.response$
    this.isLoading$ = this.response$.pipe(
      pluck('loading'),
      filter(isNonNulled),
      distinctUntilChanged()
    )
    this.result$ = this.response$.pipe(
      pluck('data', 'variants', 'nodes'),
      filter(isNonNulled)
    )
  }

  defaultOptions: Partial<FieldTypeConfig<CvcVariantInputFieldProps>> = {
    props: {
      label: 'Variant',
      placeholder: 'Search CIViC Variants',
      selectGeneMessage: 'Select a Gene to search Variants',
    },
  }
}
