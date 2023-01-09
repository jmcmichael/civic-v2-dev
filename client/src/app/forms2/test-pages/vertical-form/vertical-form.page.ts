import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { CvcFormCardWrapperProps } from '@app/forms2/wrappers/form-card/form-card.wrapper'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { noStateFormsFieldConfig } from '../no-state-forms.config'

@Component({
  selector: 'cvc-vertical-form',
  templateUrl: './vertical-form.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerticalFormPage implements OnInit {
  model: any
  form: FormGroup = new FormGroup({})
  fields: FormlyFieldConfig[]

  constructor() {
    this.model = {
      geneId: undefined,
    }

    this.fields = [
      {
        key: 'fields',
        wrappers: ['form-card'],
        props: <CvcFormCardWrapperProps>{
          title: 'Vertical Field Layout, No State',
        },
        fieldGroup: noStateFormsFieldConfig,
      },
    ]
  }

  ngOnInit(): void {}
}
