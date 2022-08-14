import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core'
import { AbstractControl } from '@angular/forms'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy } from '@ngneat/until-destroy'
import { distinctUntilChanged, Observable, startWith, Subscription } from 'rxjs'
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
  valueChange$!: Observable<any>
  statusChange$!: Observable<any>
  ngOnInit(): void {
    console.log('form-debug-panel onInit() called.')
    if (!this.cvcForm)
      throw new Error(`cvc-form-debug requires valid cvcForm Input.`)

    this.valueChange$ = this.cvcForm.valueChanges.pipe(
      startWith(this.cvcForm.value),
      tag('form-debug valueChange$')
    )

    this.statusChange$ = this.cvcForm.statusChanges.pipe(
      distinctUntilChanged(),
      tag('form-debug statusChange$')
    )
    this.subscriptions = [
      this.valueChange$.subscribe(),
      this.statusChange$.subscribe(),
    ]
  }
}
