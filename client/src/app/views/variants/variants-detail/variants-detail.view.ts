import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Maybe,
  SubscribableEntities,
  SubscribableInput,
  VariantDetailFieldsFragment,
  VariantDetailGQL,
  VariantDetailQueryVariables,
} from '@app/generated/civic.apollo';
import {
  Viewer,
  ViewerService,
} from '@app/core/services/viewer/viewer.service';
import { ApolloQueryResult } from '@apollo/client/core';
import { QueryRef } from 'apollo-angular';
import { VariantDetailQuery } from '@app/generated/civic.apollo';
import { pluck, startWith, map, takeUntil, filter, distinctUntilChanged } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { RouteableTab } from '@app/components/shared/tab-navigation/tab-navigation.component';
import { isNonNulled } from 'rxjs-etc';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'variants-detail',
  templateUrl: './variants-detail.view.html',
  styleUrls: ['./variants-detail.view.less'],
})
export class VariantsDetailView implements OnDestroy {
  queryRef?: QueryRef<VariantDetailQuery, VariantDetailQueryVariables>;

  result$!: Observable<ApolloQueryResult<VariantDetailQuery>>
  loading$!: Observable<boolean>;
  data$!: Observable<VariantDetailQuery>;
  variant$!: Observable<VariantDetailFieldsFragment>;
  commentsTotal$!: Observable<number>;
  flagsTotal$!: Observable<number>;
  viewer$!: Observable<Viewer>;

  routeSub: Subscription;
  subscribable?: SubscribableInput;

  tabs$: BehaviorSubject<RouteableTab[]>;
  destroy$ = new Subject<void>();
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
    {
      routeName: 'events',
      iconName: 'civic-event',
      tabLabel: 'Events'
    }
  ]

  constructor(
    private gql: VariantDetailGQL,
    private viewerService: ViewerService,
    private route: ActivatedRoute
  ) {
    this.tabs$ = new BehaviorSubject(this.defaultTabs);

    this.routeSub = this.route.params.subscribe((params) => {
      this.queryRef = this.gql.watch({ variantId: +params.variantId });

      this.result$ = this.queryRef.valueChanges

      this.data$ = this.result$
        .pipe(map(r => r.data),
          filter(isNonNulled));

      this.loading$ = this.result$
        .pipe(map(r => r.loading),
          filter(isNonNulled),
          distinctUntilChanged());

      this.variant$ = this.data$
        .pipe(map(r => r.variant),
          filter(isNonNulled));

      this.commentsTotal$ = this.variant$
        .pipe(map(v => v!.comments.totalCount));

      this.flagsTotal$ = this.variant$
        .pipe(map(v => v!.flags.totalCount));

      this.variant$.pipe(
        map(v => v!.revisions.totalCount),
        untilDestroyed(this)
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
        id: +params.variantId,
        entityType: SubscribableEntities.Variant
      }

      this.viewer$ = this.viewerService.viewer$;
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.destroy$.next(void 0);
    this.destroy$.unsubscribe();
  }
}
