import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Type,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import {
  GeneInputLinkableGeneGQL,
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
import { Apollo, gql, QueryRef } from 'apollo-angular'
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

export const GET_CACHED_GENE = gql`
  fragment LinkablelGene on Gene {
    id
    name
    link
  }
`

export const FETCH_GENE = gql`
  query LinkableGene($geneId: Int!) {
    gene(id: $geneId) {
      id
      name
      link
    }
  }
`

@UntilDestroy()
@Component({
  selector: 'cvc-gene-input',
  templateUrl: './gene-input.type.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcGeneInputField
  extends FieldType<FieldTypeConfig<CvcGeneInputFieldProps>>
  implements AfterViewInit
{
  // store linkable entity for tag display
  tag: Maybe<LinkableGene>

  // field interactions
  state: Maybe<EvidenceState>
  geneId$: Maybe<Subject<Maybe<number>>>

  // SOURCE STREAMS
  onTagClose$: Subject<MouseEvent>
  onSearch$: Subject<string>
  onSelect$: Subject<Maybe<number>>
  onValueChange$: Subject<Maybe<number>>
  queryRef!: QueryRef<GeneInputTypeaheadQuery, GeneInputTypeaheadQueryVariables>

  // INTERMEDIATE STREAMS
  response$!: Observable<ApolloQueryResult<GeneInputTypeaheadQuery>>
  result$!: Observable<GeneInputTypeaheadFieldsFragment[]>
  isLoading$!: Observable<boolean>

  constructor(
    private gql: GeneInputTypeaheadGQL,
    private geneQuery: GeneInputLinkableGeneGQL,
    private apollo: Apollo
  ) {
    super()
    this.onSearch$ = new Subject<string>()
    this.onSelect$ = new Subject<Maybe<number>>()
    this.onTagClose$ = new Subject<MouseEvent>()
    this.onValueChange$ = new Subject<Maybe<number>>()
  }

  ngAfterViewInit(): void {
    // get geneId$ reference from state, subscribe to push updates
    if (this.field?.options?.formState) {
      this.state = this.field.options.formState
      if (this.state && this.state.fields.geneId$) {
        this.geneId$ = this.state.fields.geneId$
        if (this.geneId$ && this.field.options?.fieldChanges) {
          this.field.options.fieldChanges
            .pipe(
              filter((c) => c.field.key === this.field.key),
              // tag('gene-input fields.geneId$'),
              untilDestroyed(this)
            )
            .subscribe((change) => {
              this.geneId$!.next(change.value)
            })
        }
      }
    }

    // on value change, fetch linkable entity from cache, or query server
    // NOTE: probably can use one of apollo's query modes to do the fetch-cache,
    // fetch server if needed but not 100% sure that does what I think
    this.onValueChange$.subscribe((gid: Maybe<number>) => {
      this.setTag(gid)
    })

    // if field has been assigned a value before its initialization, fire
    // emit geneId$ and onValueChange$ events to notify other fields and fetch
    // the tag's linkable entity
    if (this.field.formControl.value) {
      const v = this.field.formControl.value
      if (this.geneId$) this.geneId$.next(v)
      if (this.onValueChange$) this.onValueChange$.next(v)
    }

    // set up typeahead watch & fetch calls
    this.response$ = this.onSearch$.pipe(
      skip(1), // drop empty string from initial field focus
      // wait 1/3sec after typing activity stops to query server
      // quash leading event, emit trailing event so we only get 1 search string
      throttleTime(300, asyncScheduler, { leading: false, trailing: true }),
      // tag('gene-input response$'),
      switchMap((str: string) => {
        const query: GeneInputTypeaheadQueryVariables = { entrezSymbol: str }
        // helper functions for iif operator:
        const watchQuery = (query: GeneInputTypeaheadQueryVariables) => {
          // returns observable from initial watch() query
          this.queryRef = this.gql.watch(query)
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
    ) // end this.response$

    // watch for value changes
    this.formControl.valueChanges
      .pipe(tag('gene-input valueChanges'), untilDestroyed(this))
      .subscribe((gid?: number) => this.onValueChange$.next(gid))

    // NOTE: probably can remove this, as onValueChange$ fires upon selection
    // this.onSelect$
    //   .pipe(untilDestroyed(this))
    //   .subscribe((gid: Maybe<number>) => {
    //     console.log('gene-input onSelect$: ${gid}')
    //   })

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

    this.onTagClose$.pipe(untilDestroyed(this)).subscribe((_) => {
      delete this.tag
    })
  } // ngAfterViewInit()

  setTag(gid?: number) {
    if (!gid) {
      delete this.tag
      return
    }
    // linkable gene from cache
    const fragment = {
      id: `Gene:${gid}`,
      fragment: GET_CACHED_GENE,
    }
    const lgene = this.apollo.client.readFragment(fragment) as LinkableGene
    if (lgene) {
      this.tag = lgene
    } else {
      console.log(
        `gene-input field could not find cached Gene:${gid}, fetching.`
      )
      this.geneQuery.fetch({ geneId: gid }).subscribe(({ data }) => {
        const gene = data.gene
        if (gene) {
          this.tag = lgene as LinkableGene
        } else {
          console.error(
            `gene-input field could not find cached Gene:${gid}, or fetch it from the server.`
          )
        }
      })
    }
  }

  defaultOptions: Partial<FieldTypeConfig<CvcGeneInputFieldProps>> = {
    props: {
      label: 'Gene',
      placeholder: 'Search CIViC Genes',
    },
  }
}
