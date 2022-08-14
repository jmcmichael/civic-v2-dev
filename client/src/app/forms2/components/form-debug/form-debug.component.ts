import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core'
import { AbstractControl } from '@angular/forms'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy } from '@ngneat/until-destroy'
import {
    BehaviorSubject,
  combineLatestWith,
  distinctUntilChanged,
  Observable,
  startWith,
  Subscription,
} from 'rxjs'
import { combineLatestArray } from 'rxjs-etc'
import { tag } from 'rxjs-spy/operators'

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'cvc-form-debug',
  templateUrl: './form-debug.component.html',
  styleUrls: ['./form-debug.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcFormDebugComponent implements OnInit {
  @Input() cvcForm: Maybe<AbstractControl>
  selectedIndex = 0

  subscriptions!: Subscription[]
  valueChange$!: BehaviorSubject<any>
  statusChange$!: BehaviorSubject<any>
  formChange$!: Observable<any>
  constructor(private cdr: ChangeDetectorRef) {
  }
  ngOnInit(): void {
    console.log('form-debug-panel onInit() called.')
    if (!this.cvcForm)
      throw new Error(`cvc-form-debug requires valid cvcForm Input.`)

    this.valueChange$ = new BehaviorSubject(this.cvcForm.value)
    this.statusChange$ = new BehaviorSubject(this.cvcForm.status)

    this.formChange$ = combineLatestArray<any>([
      this.statusChange$,
      this.valueChange$,
    ])

    this.subscriptions = [
      this.cvcForm.valueChanges.subscribe(v => this.valueChange$.next(v)),
      this.cvcForm.statusChanges.subscribe(s => this.statusChange$.next(s)),
      this.formChange$.pipe(tag('form-debug formChange$')).subscribe(
        _ => this.cdr.markForCheck()
      ),
    ]
  }
}
