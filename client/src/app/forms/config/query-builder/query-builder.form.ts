import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  model,
  output,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
import { UntypedFormGroup } from '@angular/forms'
import {
  BooleanOperator,
  GetOriginalQueryGQL,
} from '@app/generated/civic.apollo'
import {
  AdvancedSearchEndpoint,
  AnyNormalizedQueryBuilderFormModel,
  QueryBuilderFormModel,
  QueryBuilderFormModelFor,
  QueryBuilderSearchEndpoint,
} from '@app/forms/config/query-builder/query-builder.types'
import { UntilDestroy } from '@ngneat/until-destroy'
import { catchError, EMPTY } from 'rxjs'
import { pluck } from 'rxjs-etc/operators'
import { isNonNulled } from 'rxjs-etc/dist/esm/util'
import { filter, switchMap } from 'rxjs/operators'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { getQueryFieldConfig } from '@app/forms/config/query-builder/field-config/functions/get-query-field-config'

const defaultQueryBuilderFormModel: QueryBuilderFormModel = {
  query: {
    booleanOperator: BooleanOperator.Or,
    subFilters: [],
  },
  createPermalink: true,
}

const defaultNormalizedQueryBuilderFormModel: AnyNormalizedQueryBuilderFormModel =
  {
    query: {
      booleanOperator: BooleanOperator.Or,
      subFilters: [],
    },
    createPermalink: true,
  }

@UntilDestroy()
@Component({
  selector: 'cvc-query-builder-form',
  templateUrl: './query-builder.form.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcQueryBuilderForm<E extends AdvancedSearchEndpoint> {
  searchEndpoint = model.required<QueryBuilderSearchEndpoint>()
  permalinkId = model<string>()
  resultIds = output<number[]>()

  formModel: WritableSignal<QueryBuilderFormModel> = signal(
    defaultQueryBuilderFormModel
  )
  normalizedFormModel: WritableSignal<QueryBuilderFormModelFor<E>> = signal(
    defaultNormalizedQueryBuilderFormModel as QueryBuilderFormModelFor<E>
  )

  form: UntypedFormGroup = new UntypedFormGroup({})
  fields: FormlyFieldConfig[] = []
  options: Signal<FormlyFormOptions> = computed(() => ({
    formState: {
      formLayout: 'inline',
      searchEndpoint: this.searchEndpoint(),
    },
  }))

  getOriginalQueryGQL = inject(GetOriginalQueryGQL)

  private permalinkId$ = toObservable(this.permalinkId)
  private permalinkQuery = toSignal(
    this.permalinkId$.pipe(
      filter(isNonNulled), // Only fetch if permalinkId is defined
      switchMap((id) =>
        this.getOriginalQueryGQL.fetch({ permalinkId: id }).pipe(
          pluck('data', 'searchByPermalink'),
          filter(isNonNulled),
          catchError((err) => {
            console.error('Error fetching permalink query:', err)
            return EMPTY
          })
        )
      )
    )
  )

  private permalinkSearchEndpoint?: string
  constructor() {
    /*
     * Reset form model when the search endpoint changes, while preserving
     * the form model if it was loaded from a permalink.
     */
    effect(() => {
      const endpoint = this.searchEndpoint()
      // update base form field config first, then the model
      this.fields = getQueryFieldConfig('query', endpoint, {
        title: this.searchEndpointToCardTitle(endpoint),
      })
      // only reset model if new endpoint does not equal possible permalink endpoint
      if (endpoint !== this.permalinkSearchEndpoint) {
        this.formModel.update(() =>
          structuredClone(defaultQueryBuilderFormModel)
        )
        // unset permalink query flag
        this.permalinkSearchEndpoint = undefined
      }
    })

    // load form model from permalink if provided
    effect(() => {
      const query = this.permalinkQuery()
      if (query) {
        const { searchEndpoint, formQuery, permalinkId, normalizedFormQuery } =
          query
        // Set permalink flag so the subsequent searchEndpoint.update() call
        // won't cause searchEndpoint's effect to overwrite the formModel
        this.permalinkSearchEndpoint = searchEndpoint
        // update searchEndpoint, permalinkId models
        this.searchEndpoint.update(
          () => searchEndpoint as QueryBuilderSearchEndpoint
        )
        this.permalinkId.update(() => permalinkId)
        // update formModel model with original query model from permalink response
        if (formQuery) {
          this.formModel.update((value) => {
            return {
              ...value,
              query: structuredClone(
                formQuery
              ) as QueryBuilderFormModel['query'],
            }
          })
        } else {
          console.error('searchByPermalink results did not include a formModel')
        }
        if (normalizedFormQuery) {
          this.normalizedFormModel.set(normalizedFormQuery)
          this.normalizedFormModel.update((value) => {
            return {
              ...value,
              query: structuredClone(
                normalizedFormQuery
              ) as AnyNormalizedQueryBuilderFormModel['query'],
            }
          })
        } else {
          console.error(
            'searchByPermalink results did not include a normalizedFormModel'
          )
        }
      }
    })
  }

  private searchEndpointToCardTitle(
    endpoint: QueryBuilderSearchEndpoint
  ): string {
    // Capitalize initial character
    const capitalized = endpoint.charAt(0).toUpperCase() + endpoint.slice(1)
    // Split on capital letters and join with space
    return capitalized.replace(/([A-Z])/g, ' $1').trim()
  }
}
