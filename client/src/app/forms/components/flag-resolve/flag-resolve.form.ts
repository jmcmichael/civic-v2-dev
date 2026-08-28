import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core'
import { Viewer, ViewerService } from '@app/core/services/viewer/viewer.service'
import { FlagFragment } from '@app/components/flags/flag-list-and-filter/flag-list-and-filter.gql.generated'
import { ViewerOrganizationFragment } from '@app/core/services/viewer/viewer.service.gql.generated'
import {
  ResolveFlagGQL,
  ResolveFlagMutation,
  ResolveFlagMutationVariables,
} from './flag-resolve.query.gql.generated'
import { Organization, Maybe } from '@app/generated/civic.apollo.types'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Observable } from 'rxjs'

@UntilDestroy()
@Component({
  selector: 'cvc-flag-resolve-form',
  templateUrl: './flag-resolve.form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CvcFlagResolveForm implements OnInit {
  private formMutation = inject(FormMutationService)
  @Input() flag!: FlagFragment
  @Input() flagResolvedCallback?: () => void

  selectedOrg: Maybe<ViewerOrganizationFragment>
  comment?: string

  private mutationState?: FormMutationState
  success: boolean = false
  flagResolvePopoverVisible: boolean = false

  get errorMessages(): string[] {
    return (this.mutationState?.errors() ?? []).map((e) => e.message)
  }
  get loading(): boolean {
    return this.mutationState?.isSubmitting() ?? false
  }

  viewer$: Observable<Viewer>

  constructor(
    private gql: ResolveFlagGQL,
    private viewerService: ViewerService
  ) {
    this.viewer$ = this.viewerService.viewer$
  }

  ngOnInit() {
    if (this.flag === undefined) {
      throw new Error('Must pass a Flag in to resolve component.')
    }

    this.viewerService.viewer$
      .pipe(untilDestroyed(this))
      .subscribe((v: Viewer) => {
        this.selectedOrg = v.mostRecentOrg
      })
  }

  onOrgSelected(org: Organization) {
    this.selectedOrg = org
  }

  resolveFlag() {
    if (this.comment) {
      this.success = false
      this.mutationState = this.formMutation.mutate(
        this.gql,
        {
          input: {
            id: this.flag.id,
            comment: this.comment,
            organizationId: this.selectedOrg?.id,
          },
        },
        undefined,
        () => {
          this.flagResolvePopoverVisible = false
          this.success = true
          if (this.flagResolvedCallback) {
            this.flagResolvedCallback()
          }
        }
      )
    }
  }

  dismissErrors() {
    this.mutationState = undefined
  }

  onSuccessBannerClose() {
    this.success = false
    if (this.flagResolvedCallback) {
      this.flagResolvedCallback()
    }
  }
}
