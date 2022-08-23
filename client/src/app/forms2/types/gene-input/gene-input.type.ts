import { ChangeDetectionStrategy, Component, Type } from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import {
  GeneInputTypeaheadFieldsFragment,
  GeneInputTypeaheadGQL,
  GeneInputTypeaheadQuery,
  GeneInputTypeaheadQueryVariables,
  LinkableGene,
  Maybe,
} from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field'
import { QueryRef } from 'apollo-angular'
import {
  asyncScheduler,
  defer,
  distinctUntilChanged,
  filter,
  from,
  iif,
  Observable,
  skip,
  Subject,
  switchMap,
  throttleTime,
} from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { pluck } from 'rxjs-etc/dist/esm/operators'
import { tag } from 'rxjs-spy/operators'

interface CvcGeneInputFieldProps extends FormlyFieldProps {
  placeholder: string
}

export interface CvcGeneInputFieldConfig
  extends FormlyFieldConfig<CvcGeneInputFieldProps> {
  type: 'gene-input' | Type<CvcGeneInputField>
}

@UntilDestroy()
@Component({
  selector: 'cvc-gene-input',
  templateUrl: './gene-input.type.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcGeneInputField extends FieldType<
  FieldTypeConfig<CvcGeneInputFieldProps>
> {
  // store linkable entity for tag display
  tag: Maybe<LinkableGene>

  // field interactions
  state: Maybe<EvidenceState>
  geneId$: Maybe<Subject<Maybe<number>>>

  // SOURCE STREAMS
  onSearch$: Subject<string>
  onSelect$: Subject<void>
  queryRef!: QueryRef<GeneInputTypeaheadQuery, GeneInputTypeaheadQueryVariables>

  // INTERMEDIATE STREAMS
  response$!: Observable<ApolloQueryResult<GeneInputTypeaheadQuery>>
  result$!: Observable<GeneInputTypeaheadFieldsFragment[]>
  isLoading$!: Observable<boolean>

  constructor(private gql: GeneInputTypeaheadGQL) {
    super()
    this.onSearch$ = new Subject<string>()
    this.onSelect$ = new Subject<void>()
    // set up typeahead watch, fetch calls
    this.response$ = this.onSearch$.pipe(
      skip(1), // drop empty string from initial field focus
      // wait 1/3sec after typing activity stops to query server
      // quash leading event, emit trailing event so we only get 1 search string
      throttleTime(300, asyncScheduler, { leading: false, trailing: true }),
      tag('gene-input response$'),
      switchMap((str: string) => {
        // helper functions for iif operator:
        const watchQuery = (str: string) => {
          // returns observable from initial watch() query
          this.queryRef = this.gql.watch({ entrezSymbol: str })
          return this.queryRef.valueChanges
        }
        const fetchQuery = (str: string) =>
          // returns observable from refetch() promise
          from(this.queryRef.refetch({ entrezSymbol: str }))

        // this iif operator prevents double-calling the API:
        // if queryRef doesn't exist, create it with watchQuery observable
        // if it does, refetch with fetchQuery observable.
        // using defer() ensures functions are not called until
        // values are emitted. otherwise they'll be called on subscribe.
        return iif(
          () => this.queryRef === undefined, // predicate
          defer(() => watchQuery(str)), // true
          defer(() => fetchQuery(str)) // false
        )
      })
    ) // end this.response$
    this.isLoading$ = this.response$.pipe(
      pluck('loading'),
      filter(isNonNulled),
      distinctUntilChanged()
    )
    this.result$ = this.response$.pipe(
      pluck('data', 'geneTypeahead'),
      filter(isNonNulled)
      // map((genes: GeneInputTypeaheadFieldsFragment[]) => {
      //   return genes.map(g => g.entrezId)
      // })
    )
  }

  defaultOptions: Partial<FieldTypeConfig<CvcGeneInputFieldProps>> = {
    props: {
      label: 'Gene',
      placeholder: 'Search CIViC Genes',
    },
    hooks: {
      onInit: (field) => {
        if (field?.options?.formState) {
          this.state = field.options.formState
          if (this.state && this.state.fields.geneId$) {
            this.geneId$ = this.state.fields.geneId$
            if (this.geneId$ && field.options?.fieldChanges) {
              field.options.fieldChanges
                .pipe(
                  filter((c) => c.field.key === field.key),
                  tag('gene-input fields.geneId$'),
                  untilDestroyed(this)
                )
                .subscribe((change) => {
                  this.geneId$!.next(change.value)
                })
            }
          }
        }
      },
    },
  }
}
