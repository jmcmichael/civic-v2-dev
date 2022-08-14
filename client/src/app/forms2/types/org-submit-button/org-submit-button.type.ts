import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { Viewer, ViewerService } from '@app/core/services/viewer/viewer.service'
import { Maybe, Organization } from '@app/generated/civic.apollo'
import { UntilDestroy } from '@ngneat/until-destroy'
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core'
import { BehaviorSubject, map, Observable, Subscription, tap } from 'rxjs'
import { pluck } from 'rxjs-etc/dist/esm/operators'

export interface CvcOrgSubmitButtonTypeProps extends FormlyFieldProps {
  submitLabel: string
}

const defaultProps = {
  submitLabel: 'Submit',
}
@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'cvc-org-submit-button-type',
  templateUrl: './org-submit-button.type.html',
  styleUrls: ['./org-submit-button.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvcOrgSubmitButtonComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  viewer$: Observable<Viewer>
  organizations$: Observable<Organization[]>
  mostRecentOrg$: Observable<Maybe<Organization>>

  statusChange$!: BehaviorSubject<any>
  subscriptions!: Subscription[]
  constructor(private viewerService: ViewerService, private cdr: ChangeDetectorRef) {
    super()
    this.viewer$ = this.viewerService.viewer$
    this.organizations$ = this.viewer$.pipe(pluck('organizations'))
    this.mostRecentOrg$ = this.viewer$.pipe(pluck('mostRecentOrg'))
  }

  ngOnInit(): void {
    this.props.submitLabel = this.props.submitLabel || defaultProps.submitLabel
    this.statusChange$ = new BehaviorSubject(this.form.status)
    this.subscriptions = [
      this.form.statusChanges.subscribe((s) => this.statusChange$.next(s)),
      this.statusChange$.subscribe(_ => this.cdr.detectChanges())
    ]
  }
}
