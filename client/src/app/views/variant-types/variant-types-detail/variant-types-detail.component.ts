import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApolloQueryResult } from '@apollo/client';
import { Maybe, VariantType, VariantTypeDetailGQL, VariantTypeDetailQuery, VariantTypeDetailQueryVariables } from '@app/generated/civic.apollo';
import { QueryRef } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import { isNonNulled } from 'rxjs-etc';
import { pluck, startWith, filter, map, distinctUntilChanged } from "rxjs/operators"

@Component({
  selector: 'cvc-variant-types-detail',
  templateUrl: './variant-types-detail.component.html',
  styleUrls: ['./variant-types-detail.component.less']
})
export class VariantTypesDetailComponent implements OnDestroy {
  routeSub: Subscription;
  variantTypeId!: number;

  queryRef!: QueryRef<VariantTypeDetailQuery, VariantTypeDetailQueryVariables>
  result$!: Observable<ApolloQueryResult<VariantTypeDetailQuery>>
  data$!: Observable<VariantTypeDetailQuery>
  loading$!: Observable<boolean>
  variantType$!: Observable<VariantType>

  constructor(private route: ActivatedRoute, private gql: VariantTypeDetailGQL) {
    this.routeSub = this.route.params.subscribe((params) => {
      this.variantTypeId = +params.variantTypeId;

      this.queryRef = this.gql.watch({
        variantTypeId: this.variantTypeId
      })

      this.result$ = this.queryRef.valueChanges
      this.data$ = this.result$
        .pipe(map(r => r.data),
          filter(isNonNulled))

      this.loading$ = this.result$
        .pipe(map(r => r.loading),
          distinctUntilChanged(),
          filter(isNonNulled))

      this.variantType$ = this.data$.pipe(
        map(d => d.variantType),
        filter(isNonNulled))
    });
  }
  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}
