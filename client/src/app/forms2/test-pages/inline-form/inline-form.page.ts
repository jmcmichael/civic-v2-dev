import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

@Component({
  selector: 'cvc-nonstate-form',
  templateUrl: './inline-form.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineFormPage implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
