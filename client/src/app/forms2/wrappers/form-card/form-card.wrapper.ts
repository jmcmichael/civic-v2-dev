import { Component, OnInit } from '@angular/core'
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field'
import { NzFormLayoutType } from 'ng-zorro-antd/form'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'

export interface CvcFormCardWrapperProps extends FormlyFieldProps {
  title: string
  gutterHorizontal: number
  gutterVertical: number
}

const defaultProps = {
  gutterHorizontal: 8,
  gutterVertical: 8,
}

@Component({
  selector: 'cvc-form-card',
  templateUrl: './form-card.wrapper.html',
  styleUrls: ['./form-card.wrapper.less'],
})
export class CvcFormCardWrapper
  extends FieldWrapper<FormlyFieldConfig<CvcFormCardWrapperProps>>
  implements OnInit
{
  layoutOptions: NzSelectOptionInterface[]
  formLayout$!: BehaviorSubject<NzFormLayoutType>

  get errorState() {
    return this.showError ? 'error' : ''
  }

  constructor() {
    super()
    this.layoutOptions = [
      {
        label: 'Horizontal',
        value: 'horizontal',
      },
      {
        label: 'Vertical',
        value: 'vertical',
      },
      {
        label: 'Inline',
        value: 'inline',
      },
    ]
  }

  ngOnInit(): void {
    this.props.gutterHorizontal =
      this.props.gutterHorizontal || defaultProps.gutterHorizontal
    this.props.gutterVertical =
      this.props.gutterVertical || defaultProps.gutterVertical

    this.formLayout$ = this.options.formState.formLayout$
  }
}
