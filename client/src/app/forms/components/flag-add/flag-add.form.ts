import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { Viewer, ViewerService } from '@app/core/services/viewer/viewer.service'
import { ViewerOrganizationFragment } from '@app/core/services/viewer/viewer.service.gql.generated'
import {
  FlagEntityGQL,
  FlagEntityMutation,
  FlagEntityMutationVariables,
} from './flag-add.mutation.gql.generated'
import {
  FlaggableInput,
  Maybe,
  Organization,
} from '@app/generated/civic.apollo.types'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Observable, Subject } from 'rxjs'

@UntilDestroy()
@Component({
  selector: 'cvc-flag-add-form',
  templateUrl: './flag-add.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcFlagAddForm implements OnInit {
  private formMutation = inject(FormMutationService)
  @Input() flaggable!: FlaggableInput
  @Input() flagAddedCallback?: () => void

  private mutationState?: FormMutationState
  success: boolean = false

  get errorMessages(): string[] {
    return this.mutationState?.errors() ?? []
  }
  get loading(): boolean {
    return this.mutationState?.isSubmitting() ?? false
  }

  viewer$: Observable<Viewer>

  comment: string = ''
  selectedOrg: Maybe<ViewerOrganizationFragment>

  constructor(
    private gql: FlagEntityGQL,
    private viewerService: ViewerService,
    private networkErrorService: NetworkErrorsService
  ) {
    this.viewer$ = this.viewerService.viewer$
    this.viewerService.viewer$
      .pipe(untilDestroyed(this))
      .subscribe((v: Viewer) => {
        this.selectedOrg = v.mostRecentOrg
      })
  }

  ngOnInit() {
    //For some reason this doesn't work to initially set the org id on entities without any flags.
    //It works on pages with one or more flags. Not sure why

    if (this.flaggable === undefined) {
      throw new Error('Must pass a flagggable into flag add component')
    }
  }

  onOrgSelected(org: Organization) {
    this.selectedOrg = org
  }

  submitFlag() {
    let input = {
      comment: this.comment,
      subject: this.flaggable,
      organizationId: this.selectedOrg?.id,
    }

    this.mutationState = this.formMutation.mutate(
      this.gql,
      { input: input },
      undefined,
      () => {
        if (this.flagAddedCallback) {
          this.flagAddedCallback()
        }
        this.success = true
        this.comment = ''
      }
    )
  }

  onSuccessBannerClose() {
    this.success = false
  }
}
