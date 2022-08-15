import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core'
import { Viewer, ViewerService } from '@app/core/services/viewer/viewer.service'
import { Maybe, Organization } from '@app/generated/civic.apollo'
import { UntilDestroy } from '@ngneat/until-destroy'
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core'
import { NzButtonType } from 'ng-zorro-antd/button'
import { BooleanInput } from 'ng-zorro-antd/core/types'
import {
    BehaviorSubject, Observable,
    Subject,
    Subscription
} from 'rxjs'
import { pluck } from 'rxjs-etc/dist/esm/operators'
import {
    ButtonMutation,
    CvcOrgSubmitButtonDirective
} from './org-submit-button.directive'

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcOrgSubmitButtonComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit, AfterViewInit
{
  @Input() selectedOrg!: Maybe<Organization>
  @Output() selectedOrgChange = new EventEmitter<Organization>()

  @Input() buttonType: NzButtonType = 'primary'
  @Input() nzDanger: BooleanInput = false
  @Input() nzSize: 'large' | 'default' | 'small' = 'small'

  @ViewChild(CvcOrgSubmitButtonDirective, { static: false })
  button?: CvcOrgSubmitButtonDirective

  viewer$: Observable<Viewer>
  organizations$: Observable<Organization[]>
  mostRecentOrg$: Observable<Maybe<Organization>>

  isDisabled$: Subject<boolean>
  isHidden$: Subject<boolean>
  buttonClass$: BehaviorSubject<string>
  baseButtonClass = 'org-dropdown-btn'

  statusChange$!: BehaviorSubject<any>
  subscriptions!: Subscription[]
  constructor(
    private viewerService: ViewerService,
    private cdr: ChangeDetectorRef
  ) {
    super()
    this.viewer$ = this.viewerService.viewer$
    this.organizations$ = this.viewer$.pipe(pluck('organizations'))
    this.mostRecentOrg$ = this.viewer$.pipe(pluck('mostRecentOrg'))

    this.isDisabled$ = new Subject()
    this.isHidden$ = new Subject<boolean>()
    this.buttonClass$ = new BehaviorSubject<string>('')
  }

  selectOrg(org: any): void {
    this.selectedOrg = org
    this.selectedOrgChange.emit(org)
  }

  ngOnInit(): void {
    this.props.submitLabel = this.props.submitLabel || defaultProps.submitLabel
    this.statusChange$ = new BehaviorSubject(this.form.status)
    this.subscriptions = [
      this.form.statusChanges.subscribe((s) => this.statusChange$.next(s)),
      this.statusChange$.subscribe((_) => this.cdr.detectChanges()),
    ]
  }

  ngAfterViewInit() {
    // subscribe to org-selector-btn.directive's domChange @Output,
    // emit mutation events from the appropriate Subjects
    if (this.button) {
      if (this.button.domChange) {
        const sub = this.button.domChange
          .subscribe((m: ButtonMutation) => {
            if (m.type === 'class' && typeof m.change === 'string') {
              // preserve base class by preprending it
              this.buttonClass$.next(`${this.baseButtonClass} ${m.change}`)
            } else if (m.type === 'disabled' && typeof m.change === 'boolean') {
              this.isDisabled$.next(m.change)
            } else if (m.type === 'hidden' && typeof m.change === 'boolean') {
              this.isHidden$.next(m.change)
            }
          })
        this.subscriptions.push(sub)
      }
    }
  }
}
