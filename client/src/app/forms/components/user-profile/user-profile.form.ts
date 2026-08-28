import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core'
import {
  toNullableInput,
  toNullableString,
} from '@app/forms/utilities/input-formatters'
import {
  CountriesGQL,
  UpdateUserProfileGQL,
  UpdateUserProfileMutation,
  UpdateUserProfileMutationVariables,
} from './user-profile.mutation.gql.generated'
import {
  AreaOfExpertise,
  EditUserInput,
  Maybe,
} from '@app/generated/civic.apollo.types'
import { UserDetailFieldsFragment } from '@app/views/users/users-detail/users-detail.query.gql.generated'

import { Subject, Observable } from 'rxjs'
import { map, takeUntil } from 'rxjs/operators'

@Component({
  selector: 'cvc-user-profile-form',
  templateUrl: './user-profile.form.html',
  styleUrls: ['./user-profile.form.less'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CvcUserProfileForm implements OnInit, OnDestroy {
  private formMutation = inject(FormMutationService)
  @Input() user!: UserDetailFieldsFragment
  @Output() profileUpdatedEvent = new EventEmitter<void>()

  private mutationState?: FormMutationState
  success: boolean = false

  get errorMessages(): string[] {
    return this.mutationState?.errors() ?? []
  }
  get loading(): boolean {
    return this.mutationState?.isSubmitting() ?? false
  }

  private destroy$ = new Subject<void>()

  name: Maybe<string>
  username: Maybe<string>
  email: Maybe<string>
  areaOfExpertise: Maybe<AreaOfExpertise>
  orcid: Maybe<string>
  url: Maybe<string>
  bio: Maybe<string>
  twitterHandle: Maybe<string>
  facebookProfile: Maybe<string>
  linkedinProfile: Maybe<string>

  countryId: Maybe<number>

  countries$: Observable<{ id: number; name: string }[]>

  constructor(
    private updateProfileGql: UpdateUserProfileGQL,
    countryIdGql: CountriesGQL
  ) {
    this.countries$ = countryIdGql
      .fetch()
      .pipe(map(({ data }) => data?.countries ?? []))
  }

  ngOnInit() {
    if (!this.user) {
      throw new Error('Must pass a user into the Profile Update Form')
    }

    this.setInitialFormFields()
  }

  updateProfile() {
    if (this.username && this.email) {
      this.success = false
      let profileInput: EditUserInput = {
        username: this.username,
        email: this.email,
        name: toNullableString(this.name),
        areaOfExpertise: toNullableInput(this.areaOfExpertise),
        orcid: toNullableString(this.orcid),
        url: toNullableString(this.url),
        bio: toNullableString(this.bio),
        countryId: toNullableInput(this.countryId),
        twitterHandle: toNullableString(this.twitterHandle),
        facebookProfile: toNullableString(this.facebookProfile),
        linkedinProfile: toNullableString(this.linkedinProfile),
      }

      this.mutationState = this.formMutation.mutate(
        this.updateProfileGql,
        { input: profileInput },
        undefined,
        () => {
          this.setInitialFormFields()
          this.success = true
          this.profileUpdatedEvent.emit()
        }
      )
    }
  }

  setInitialFormFields() {
    this.name = this.user.name
    this.username = this.user.username
    this.email = this.user.email
    this.areaOfExpertise = this.user.areaOfExpertise
    this.orcid = this.user.orcid
    this.url = this.user.url
    this.bio = this.user.bio
    this.twitterHandle = this.user.twitterHandle
    this.facebookProfile = this.user.facebookProfile
    this.linkedinProfile = this.user.linkedinProfile
    this.countryId = this.user.country?.id
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
