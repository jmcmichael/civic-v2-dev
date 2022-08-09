import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Maybe, Phenotype, PhenotypeDetailGQL, PhenotypeDetailQuery, PhenotypeDetailQueryVariables } from '@app/generated/civic.apollo';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { QueryRef } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import { isNonNulled } from 'rxjs-etc';
import { filter, pluck, startWith } from "rxjs/operators";

@Component({
  selector: 'cvc-phenotypes-detail',
  templateUrl: './phenotypes-detail.component.html',
  styleUrls: ['./phenotypes-detail.component.less']
})

@UntilDestroy()
export class PhenotypesDetailComponent {
  routeSub: Subscription;
  phenotypeId?: number;

  queryRef?: QueryRef<PhenotypeDetailQuery, PhenotypeDetailQueryVariables>

  loading$?: Observable<boolean>;
  phenotype$!: Observable<Maybe<Phenotype>>

  constructor(private route: ActivatedRoute, private gql: PhenotypeDetailGQL) {
    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.phenotypeId = +params.phenotypeId;

        this.queryRef = this.gql.watch({
          phenotypeId: this.phenotypeId
        })

        let observable = this.queryRef.valueChanges
        this.loading$ = observable
          .pipe(pluck('loading'),
                filter(isNonNulled));

        this.phenotype$ = observable
          .pipe(pluck('data', 'phenotype'));
      });
  }
}
