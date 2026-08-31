import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  Signal,
  Type,
  computed,
  inject,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ViewerService } from '@app/core/services/viewer/viewer.service'
import { ViewerOrganizationFragment } from '@app/core/services/viewer/viewer.service.gql.generated'
import { Maybe } from '@app/generated/civic.apollo.types'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldType,
  FieldTypeConfig,
  FormlyConfig,
  FormlyFieldConfig,
} from '@ngx-formly/core'
import { filter } from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { pluck } from 'rxjs-etc/operators'
import { CvcFormSubmissionStatusDisplayComponent } from '@app/forms/components/form-submission-status-display/form-submission-status-display.component'
import { CvcColWrapperProps } from '@app/forms/wrappers/grid/col.wrapper'
import {
  describeFieldIssues,
  FormFieldIssue,
} from '@app/forms/utilities/form-field-issues'
import { createFormReadiness } from '@app/forms/utilities/form-readiness'
import { CvcFormActionsRowWrapper } from '@app/forms/wrappers/form-actions-row/form-actions-row.wrapper'
import { Apollo } from 'apollo-angular'
import { NzButtonSize } from 'ng-zorro-antd/button'

interface CvcOrgSubmitButtonProps extends CvcColWrapperProps {
  submitLabel: string
  align?: 'left' | 'right' | 'center'
  size?: NzButtonSize
}

export interface CvcOrgSubmitButtonFieldConfig extends FormlyFieldConfig<CvcOrgSubmitButtonProps> {
  type: 'org-submit-button' | Type<CvcOrgSubmitButtonComponent>
}

@UntilDestroy()
@Component({
  selector: 'cvc-org-submit-button',
  templateUrl: './org-submit-button.type.html',
  styleUrls: ['./org-submit-button.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcOrgSubmitButtonComponent
  extends FieldType<FieldTypeConfig<CvcOrgSubmitButtonProps>>
  implements OnInit
{
  private injector = inject(Injector)
  private apollo = inject(Apollo)
  // the registered message catalog, for resolving each issue's sentence
  private formlyConfig = inject(FormlyConfig)
  private statusDisplay = inject(CvcFormSubmissionStatusDisplayComponent, {
    optional: true,
  })

  // an outstanding submit failure paints the button danger until the next
  // edit dismisses it (mirroring the footer alert's visibility)
  readonly submitError = computed(() => {
    const display = this.statusDisplay
    if (!display || display.dismissed()) return false
    return (display.state()?.errors().length ?? 0) > 0
  })

  // inside an actions row the readiness is the row's, derived once for all
  // three columns; a submit button used on its own (the quick-add forms in
  // the select fields) still derives its own
  private actionsRow = inject(CvcFormActionsRowWrapper, { optional: true })

  readonly mostRecentOrg: Signal<Maybe<ViewerOrganizationFragment>>
  formValid!: Signal<boolean>
  fieldIssues!: Signal<FormFieldIssue[]>
  /**
   * What the button's tooltip says. A submittable button names the
   * organization the submission is credited to; a disabled one answers the
   * question the curator actually has, which is why it is disabled.
   *
   * Assigned in ngOnInit because it derives from signals that only exist once
   * formly has attached the form.
   */
  tooltipTitle!: Signal<string>

  defaultOptions: Partial<FieldTypeConfig<CvcOrgSubmitButtonProps>> = {
    props: {
      submitLabel: 'Submit',
    },
  }

  constructor(private viewerService: ViewerService) {
    super()
    this.mostRecentOrg = toSignal(
      this.viewerService.viewer$.pipe(pluck('mostRecentOrg')),
      { initialValue: undefined }
    )
  }

  ngOnInit(): void {
    // form & field attach after construction, so this cannot run earlier
    const readiness =
      this.actionsRow?.readiness ??
      createFormReadiness(this.field, this.form, {
        injector: this.injector,
        apollo: this.apollo,
        formlyConfig: this.formlyConfig,
      })
    this.formValid = readiness.formValid
    this.fieldIssues = readiness.fieldIssues

    this.tooltipTitle = computed(() => {
      if (!this.formValid()) return describeFieldIssues(this.fieldIssues())
      const org = this.mostRecentOrg()
      return org ? `For ${org.name}` : ''
    })

    // keep the field's value synced to the viewer's most recent org
    this.viewerService.viewer$
      .pipe(
        pluck('mostRecentOrg'),
        filter(isNonNulled),
        pluck('id'),
        untilDestroyed(this)
      )
      .subscribe((id) => {
        this.formControl.setValue(id)
      })
  }
}
