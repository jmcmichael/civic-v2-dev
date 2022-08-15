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
  map,
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

  // SOURCE STREAMS
  viewer$: Observable<Viewer>
  organizationId$!: BehaviorSubject<Maybe<number>>
  selectedOrg$!: Observable<Maybe<Organization>>

  organizations$: Observable<Organization[]>
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
    this.organizationId$ = new BehaviorSubject<Maybe<number>>(undefined)
    this.selectedOrg$ = this.organizationId$.pipe(
      withLatestFrom(this.organizations$),
      map(([id, orgs]: [Maybe<number>, Organization[]]) => {
        return orgs.find((o) => (o.id === id))
      })
    )
    this.subscriptions = []
  }

  ngOnInit(): void {
    // set defaults
    this.props.submitLabel = this.props.submitLabel || defaultProps.submitLabel
    // emit viewer.mostRecentOrg.id as initial organizationId
    this.viewer$.pipe(filter(isNonNulled), first()).subscribe((v: Viewer) => {
      this.organizationId$.next(v.mostRecentOrg?.id)
    })
    // create subject for detecting changes on form update events,
    // starting with initial form status (required for OnPush)
    this.formUpdate$ = new BehaviorSubject(this.form.status)
    // emit form update events from formUpdate$
    const fcSub = this.form.statusChanges.subscribe((s) =>
      this.formUpdate$.next(s)
    )
    // call detectChanges for each form update event
    const scSub = this.formUpdate$.subscribe((_) => this.cdr.detectChanges())

    // set field value to emitted orgId$ updates
    const mroSub = this.organizationId$.subscribe((oid) => {
      this.formControl.setValue(oid)
    })
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
