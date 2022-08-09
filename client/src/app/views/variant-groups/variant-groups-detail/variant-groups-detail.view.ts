import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import {
  Viewer,
  ViewerService,
} from '@app/core/services/viewer/viewer.service';
import {
  Maybe,
  VariantGroupDetailFieldsFragment,
  SubscribableEntities,
  SubscribableInput,
  VariantGroupDetailGQL,
  VariantGroupDetailQueryVariables,
  VariantGroupDetailQuery
} from '@app/generated/civic.apollo';
import { ActivatedRoute } from '@angular/router';
import { pluck, startWith, takeUntil, map, filter } from 'rxjs/operators';
import { RouteableTab } from '@app/components/shared/tab-navigation/tab-navigation.component';
import { QueryRef } from 'apollo-angular';
import { ApolloQueryResult } from '@apollo/client';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { isNonNulled } from 'rxjs-etc';

@UntilDestroy()
@Component({
  selector: 'cvc-variant-groups-detail',
  templateUrl: './variant-groups-detail.view.html',
  styleUrls: ['./variant-groups-detail.view.less']
})
export class VariantGroupsDetailView implements OnInit {
  queryRef!: QueryRef<VariantGroupDetailQuery, VariantGroupDetailQueryVariables>
  result$!: Observable<ApolloQueryResult<VariantGroupDetailQuery>>
  loading$!: Observable<boolean>
  data$!: Observable<VariantGroupDetailQuery>
  variantGroup$!: Observable<VariantGroupDetailFieldsFragment>;
  viewer$!: Observable<Viewer>;
  commentsTotal$!: Observable<number>;
  revisionsTotal$!: Observable<number>;
  flagsTotal$!: Observable<number>;

  subscribable!: SubscribableInput

  tabs$: BehaviorSubject<RouteableTab[]>;
  defaultTabs: RouteableTab[] = [
    {
      routeName: 'summary',
      iconName: 'pic-left',
      tabLabel: 'Summary'
    },
    {
      routeName: 'comments',
      iconName: 'civic-comment',
      tabLabel: 'Comments'
    },
    {
      routeName: 'revisions',
      iconName: 'civic-revision',
      tabLabel: 'Revisions'
    },
    {
      routeName: 'flags',
      iconName: 'civic-flag',
      tabLabel: 'Flags'
    },
  ]

  constructor(
    private gql: VariantGroupDetailGQL,
    private viewerService: ViewerService,
    private route: ActivatedRoute
  ) {
    this.viewer$ = this.viewerService.viewer$;
    this.tabs$ = new BehaviorSubject(this.defaultTabs);

    this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.queryRef = this.gql.watch({ variantGroupId: +params.variantGroupId })
        this.result$ = this.queryRef.valueChanges

        this.loading$ = this.result$
          .pipe(map(r => r.loading));

        this.data$ = this.result$
          .pipe(map(r => r.data),
            filter(isNonNulled))

        this.variantGroup$ = this.data$
          .pipe(map(d => d.variantGroup),
            filter(isNonNulled))

        this.commentsTotal$ = this.variantGroup$.pipe(pluck('comments', 'totalCount'));

        this.flagsTotal$ = this.variantGroup$.pipe(pluck('flags', 'totalCount'));

        this.variantGroup$.pipe(
          pluck('revisions', 'totalCount'),
        ).subscribe({
          next: (count) => {
            this.tabs$.next(
              this.defaultTabs.map((tab) => {
                if (tab.tabLabel === 'Revisions') {
                  return {
                    badgeCount: count as number,
                    ...tab
                  }
                }
                else {
                  return tab
                }
              }
              ))
          }
        })

        this.subscribable = {
          id: +params.variantGroupId,
          entityType: SubscribableEntities.VariantGroup
        }

      });
  }

  ngOnInit(): void {
  }

}
