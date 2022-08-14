import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { AbstractControl } from '@angular/forms'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy } from '@ngneat/until-destroy'
import { Observable } from 'rxjs'
import { tag } from 'rxjs-spy/operators'

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvc-form-debug',
  templateUrl: './form-debug.component.html',
  styleUrls: ['./form-debug.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvcFormDebugComponent implements OnInit {
  @Input() cvcModel: any
  @Input() cvcForm: Maybe<AbstractControl>

  selectedIndex = 0

  valueChange$: Maybe<Observable<any>>
  statusChange$: Maybe<Observable<any>>
  ngOnInit(): void {
    console.log('form-debug-panel onInit() called.')
    if (!this.cvcForm)
      throw new Error(`cvc-form-debug requires valid cvcForm Input.`)

    this.valueChange$ = this.cvcForm.valueChanges.pipe(
      tag('form-debug valueChange$')
    )
    this.valueChange$.subscribe()

    this.statusChange$ = this.cvcForm.statusChanges.pipe(
      tag('form-debug statusChange$')
    )
    this.statusChange$.subscribe()
  }
}
