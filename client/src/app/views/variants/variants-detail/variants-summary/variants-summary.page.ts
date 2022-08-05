import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  VariantSummaryGQL,
  Maybe,
  VariantSummaryQuery,
  VariantSummaryQueryVariables,
  VariantSummaryFieldsFragment,
  SubscribableInput,
  SubscribableEntities,
  MyVariantInfoFieldsFragment,
} from '@app/generated/civic.apollo';
import { QueryRef } from 'apollo-angular';
import { pluck, startWith, map, filter, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { isNonNulled } from 'rxjs-etc';
import { ApolloQueryResult } from '@apollo/client';

@Component({
  selector: 'cvc-variants-summary',
  templateUrl: './variants-summary.page.html',
  styleUrls: ['./variants-summary.page.less'],
})
export class VariantsSummaryPage {
  @Input() variantId: Maybe<number>;

  queryRef: QueryRef<VariantSummaryQuery, VariantSummaryQueryVariables>;
  result$: Observable<ApolloQueryResult<VariantSummaryQuery>>
  loading$: Observable<boolean>;
  data$: Observable<VariantSummaryQuery>;
  variant$: Observable<VariantSummaryFieldsFragment>;
  variantInfo$: Observable<Maybe<MyVariantInfoFieldsFragment>>;

  subscribable: SubscribableInput;

  constructor(private gql: VariantSummaryGQL, private route: ActivatedRoute) {
    var queryVariantId: number;
    if (this.variantId) {
      queryVariantId = this.variantId;
    } else {
      queryVariantId = +this.route.snapshot.params['variantId'];
    }

    if (queryVariantId == undefined) {
      throw new Error(
        'Must pass in a variant ID as an input or via the route.'
      );
    }
    this.queryRef = this.gql.watch({ variantId: queryVariantId })
    this.result$ = this.queryRef.valueChanges

    this.loading$ = this.result$
      .pipe(map(r => r.loading),
        filter(isNonNulled),
        distinctUntilChanged());

    this.data$ = this.result$
      .pipe(map(r => r.data),
        filter(isNonNulled));

    this.variant$ = this.data$
      .pipe(map(r => r.variant),
        filter(isNonNulled));

    this.variantInfo$ = this.variant$
      .pipe(map(v => v.myVariantInfo),
        filter(isNonNulled));

    this.subscribable = {
      entityType: SubscribableEntities.Variant,
      id: queryVariantId,
    };
  }
}
