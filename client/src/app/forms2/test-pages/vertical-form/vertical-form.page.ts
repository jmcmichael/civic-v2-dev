import { Component, OnInit } from '@angular/core'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
import { FormGroup } from '@angular/forms'
import { CvcFormCardWrapperProps } from '@app/forms2/wrappers/form-card/form-card.wrapper'
import { CvcGeneSelectFieldConfig } from '@app/forms2/types/gene-select/gene-select.type'

@Component({
  selector: 'cvc-vertical-form',
  templateUrl: './vertical-form.page.html',
  styleUrls: ['./vertical-form.page.less'],
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
        fieldGroup: [
          <CvcGeneSelectFieldConfig>{
            key: 'geneId',
            type: 'gene-select',
            props: {
              required: true,
            },
          },
        ],
      },
    ]
  }

  ngOnInit(): void {}
}
