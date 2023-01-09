import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

@Component({
  selector: 'cvc-nonstate-form',
  templateUrl: './horizontal-form.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HorizontalFormPage implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
