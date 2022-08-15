import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { Viewer, ViewerService } from '@app/core/services/viewer/viewer.service'
import { Maybe, Organization } from '@app/generated/civic.apollo'
import { UntilDestroy } from '@ngneat/until-destroy'
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core'
import { NzButtonType } from 'ng-zorro-antd/button'
import { BooleanInput } from 'ng-zorro-antd/core/types'
import { NzMenuItemDirective } from 'ng-zorro-antd/menu'
import {
  BehaviorSubject,
  filter,
  first,
  Observable,
  Subject,
  Subscription,
  withLatestFrom,
} from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { pluck } from 'rxjs-etc/dist/esm/operators'
import { tag } from 'rxjs-spy/operators'
import {
  ButtonMutation,
  CvcOrgSubmitButtonDirective,
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
  @ViewChild(CvcOrgSubmitButtonDirective, { static: false })
  button?: CvcOrgSubmitButtonDirective

  viewer$: Observable<Viewer>
  organizations$: Observable<Organization[]>
  mostRecentOrgId$!: BehaviorSubject<number | undefined>
  isDisabled$: Subject<boolean>
  isHidden$: Subject<boolean>
  buttonClass$!: BehaviorSubject<string>
  baseButtonClass = 'org-dropdown-btn'

  formUpdate$!: BehaviorSubject<any>
  menuSelection$: Subject<NzMenuItemDirective> = new Subject()
  subscriptions: Subscription[]
  constructor(
    private viewerService: ViewerService,
    private cdr: ChangeDetectorRef
  ) {
    super()
    this.viewer$ = this.viewerService.viewer$
    this.organizations$ = this.viewer$.pipe(pluck('organizations'))

    this.isDisabled$ = new Subject()
    this.isHidden$ = new Subject<boolean>()
    this.buttonClass$ = new BehaviorSubject<string>(this.baseButtonClass)
    this.subscriptions = []
  }

  ngOnInit(): void {
    // set defaults
    this.props.submitLabel = this.props.submitLabel || defaultProps.submitLabel
    // create mostRecentOrg subject, with
    this.viewer$.pipe(filter(isNonNulled), first()).subscribe((v: Viewer) => {
      this.mostRecentOrgId$ = new BehaviorSubject(v.mostRecentOrg?.id)
    })
    // create subject for updating component when form status changes,
    // start with initial form status (required for OnPush)
    this.formUpdate$ = new BehaviorSubject(this.form.status)
    // watch form for any status changes, call detectChanges
    const fcSub = this.form.statusChanges.subscribe((s) =>
      this.formUpdate$.next(s)
    )
    const scSub = this.formUpdate$.subscribe((_) => this.cdr.detectChanges())

    // set formControl value to most recent org id
    const mroSub = this.mostRecentOrgId$.subscribe((oid) =>
      this.formControl.setValue(oid)
    )

    this.subscriptions = this.subscriptions.concat([fcSub, scSub, mroSub])
  }

  ngAfterViewInit() {
    // subscribe to org-selector-btn.directive's domChange @Output,
    // emit mutation events from the appropriate Subjects
    if (this.button) {
      if (this.button.domChange) {
        const sub = this.button.domChange.subscribe((m: ButtonMutation) => {
          if (m.type === 'class' && typeof m.change === 'string') {
            // preserve base class by preprending it
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
