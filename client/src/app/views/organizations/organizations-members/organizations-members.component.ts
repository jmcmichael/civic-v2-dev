import { Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Maybe, OrganizationMembersQuery, OrganizationMembersFieldsFragment, OrganizationMembersGQL, OrganizationMembersQueryVariables, PageInfo } from "@app/generated/civic.apollo";
import { Viewer, ViewerService } from "@app/core/services/viewer/viewer.service";
import { QueryRef } from "apollo-angular";
import { filter, map, pluck, startWith } from "rxjs/operators";
import { Observable } from 'rxjs';
import { isNonNulled } from "rxjs-etc";
import { ApolloQueryResult } from "@apollo/client";

@Component({
  selector: 'cvc-organizations-members',
  templateUrl: './organizations-members.component.html',
  styleUrls: ['./organizations-members.component.less']
})
export class OrganizationsMembersComponent {
  queryRef: QueryRef<OrganizationMembersQuery, OrganizationMembersQueryVariables>;

  result$: Observable<ApolloQueryResult<OrganizationMembersQuery>>
  data$: Observable<OrganizationMembersQuery>
  members$: Observable<Maybe<OrganizationMembersFieldsFragment>[]>
  loading$: Observable<boolean>
  viewer$: Observable<Viewer>
  pageInfo$?: Observable<PageInfo>

  initialPageSize = 20

  constructor(private gql: OrganizationMembersGQL, private viewerService: ViewerService, private route: ActivatedRoute) {

    const organizationId: number = +this.route.snapshot.params['organizationId'];

    this.queryRef = this.gql.watch({
      organizationId: organizationId,
      first: this.initialPageSize,
    });

    this.result$ = this.queryRef.valueChanges

    this.loading$ = this.result$
      .pipe(map(r => r.loading))

    this.data$ = this.result$
      .pipe(map(r => r.data), filter(isNonNulled))

    this.members$ = this.data$
      .pipe(map(d => d.users.edges),
        map(e => e.map((e) => e.node)),
        filter(isNonNulled),
      );

    this.pageInfo$ = this.result$.pipe(
      pluck('data', 'users', 'pageInfo')
    )

    this.viewer$ = this.viewerService.viewer$;
  }

  loadMore(cursor: Maybe<string>) {
    this.queryRef.fetchMore({
      variables: {
        after: cursor
      }
    })
  }
}
