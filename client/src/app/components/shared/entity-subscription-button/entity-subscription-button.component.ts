import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core'
import { Viewer } from '@app/core/services/viewer/viewer.service'
import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import {
  SubscriptionForEntityGQL,
  SubscriptionForEntityQuery,
  SubscriptionForEntityQueryVariables,
  SubscriptionIdFragment,
} from './entity-subscription-button.gql.generated'
import {
  Maybe,
  SubscribableEntities,
  SubscribableInput,
} from '@app/generated/civic.apollo.types'
import {
  SubscribeGQL,
  UnsubscribeGQL,
} from '@app/views/users/users-notifications/users-notifications.query.gql.generated'
import { onlyCompleteData, QueryRef } from 'apollo-angular'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'cvc-entity-subscription-button',
  templateUrl: './entity-subscription-button.component.html',
  styleUrls: ['./entity-subscription-button.component.less'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CvcEntitySubscriptionButtonComponent implements OnInit {
  @Input() viewer!: Viewer
  @Input() typename!: string
  @Input() subscribableId!: number

  subscribable!: SubscribableInput

  existingSubscription$?: Observable<Maybe<SubscriptionIdFragment>>
  queryRef?: QueryRef<
    SubscriptionForEntityQuery,
    SubscriptionForEntityQueryVariables
  >
  submitState?: FormMutationState

  constructor(
    private isSubscribedGQL: SubscriptionForEntityGQL,
    private unsubscribeMutation: UnsubscribeGQL,
    private subscribeMutation: SubscribeGQL,
    private formMutation: FormMutationService
  ) {}

  ngOnInit() {
    if (this.viewer === undefined) {
      throw new Error(
        'Must pass in a viewer to the CvcEntitySubscriptionButtonComponent'
      )
    }
    if (this.typename === undefined) {
      throw new Error(
        'Must pass in a typename to the CvcEntitySubscriptionButtonComponent'
      )
    }
    if (this.subscribableId === undefined) {
      throw new Error(
        'Must pass in a subscribableId to the CvcEntitySubscriptionButtonComponent'
      )
    }

    let entityType: keyof typeof SubscribableEntities = <
      keyof typeof SubscribableEntities
    >this.typename
    this.subscribable = {
      id: this.subscribableId,
      entityType: SubscribableEntities[entityType],
    }
    this.queryRef = this.isSubscribedGQL.watch({
      variables: {
        subscribable: this.subscribable,
      },
    })

    // no isNonNulled filter: the null after an unsubscribe is the emission
    // that flips the button back to its subscribe state
    this.existingSubscription$ = this.queryRef.valueChanges.pipe(
      onlyCompleteData(),
      map(({ data }) => data.subscriptionForEntity)
    )
  }

  subscribe() {
    if (this.subscribable) {
      this.submitState = this.formMutation.mutate(
        this.subscribeMutation,
        { input: { subscribables: [this.subscribable] } },
        undefined,
        () => this.queryRef?.refetch()
      )
    }
  }

  unsubscribe() {
    if (this.subscribable) {
      this.submitState = this.formMutation.mutate(
        this.unsubscribeMutation,
        { input: { subscribables: [this.subscribable] } },
        undefined,
        () => this.queryRef?.refetch()
      )
    }
  }
}
