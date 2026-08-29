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
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core'
import { auditTime, EMPTY, filter, map, merge, Observable } from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { pluck } from 'rxjs-etc/operators'
import { CvcFormSubmissionStatusDisplayComponent } from '@app/forms/components/form-submission-status-display/form-submission-status-display.component'
import { CvcColWrapperProps } from '@app/forms/wrappers/grid/col.wrapper'
import {
  collectFieldIssues,
  describeFieldIssues,
  FormFieldIssue,
} from '@app/forms/utilities/form-field-issues'
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
    // form & field attach after construction, hence the injector-scoped toSignal
    const formChange$ = merge(
      this.form.statusChanges as Observable<unknown>,
      (this.field.options?.fieldChanges ?? EMPTY) as Observable<unknown>
    ).pipe(auditTime(0))
    this.formValid = toSignal(formChange$.pipe(map(() => this.form.valid)), {
      initialValue: this.form.valid,
      injector: this.injector,
    })
    // feeds the footer alert's pre-submit readiness state
    this.fieldIssues = toSignal(
      formChange$.pipe(map(() => collectFieldIssues(this.field))),
      { initialValue: collectFieldIssues(this.field), injector: this.injector }
    )
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
