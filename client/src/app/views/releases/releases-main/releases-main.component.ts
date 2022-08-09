import { Component, OnInit } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { DataReleasesGQL, DataReleasesQuery, ReleaseFragment } from '@app/generated/civic.apollo';
import { Observable } from 'rxjs';
import { isNonNulled } from 'rxjs-etc';
import { startWith, pluck, map, filter } from 'rxjs/operators';

@Component({
  selector: 'cvc-releases-main',
  templateUrl: './releases-main.component.html',
  styleUrls: ['./releases-main.component.less']
})
export class ReleasesMainComponent {
  result$: Observable<ApolloQueryResult<DataReleasesQuery>>
  loading$: Observable<boolean>;
  releases$: Observable<ReleaseFragment[]>

  constructor(private gql: DataReleasesGQL) {
    let queryRef = this.gql.watch()
    this.result$ = queryRef.valueChanges

    this.loading$ = this.result$
      .pipe(map(r => r.loading),
        filter(isNonNulled))

    this.releases$ = this.result$
      .pipe(
        map(r => r.data.dataReleases),
        filter(isNonNulled))
  }

}
