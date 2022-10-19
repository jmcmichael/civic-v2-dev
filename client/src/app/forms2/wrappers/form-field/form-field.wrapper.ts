import { AfterViewInit, Component, OnInit } from '@angular/core'
import {
  FieldWrapper,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { IndexableObject } from 'ng-zorro-antd/core/types'
import { EmbeddedProperty, NzAlign, NzJustify } from 'ng-zorro-antd/grid'

export interface CvcFormFieldWrapperProps extends FormlyFieldProps {
  hideRequiredMarker?: boolean
  hideLabel?: boolean
  layout: {
    // nz-form-item
    item?: {
      gutter?:
        | string
        | number
        | IndexableObject
        | [number, number]
        | [IndexableObject, IndexableObject]
      justify?: NzJustify
      align?: NzAlign
    }
    label: {
      span: number
      flex?: number | string
      reactive?: {
        xs: string | number | EmbeddedProperty
        sm: string | number | EmbeddedProperty
        md: string | number | EmbeddedProperty
        lg: string | number | EmbeddedProperty
        xl: string | number | EmbeddedProperty
        xxl: string | number | EmbeddedProperty
      }
    }
    control: {
      span: number
      flex?: number | string
      reactive?: {
        xs: string | number | EmbeddedProperty
        sm: string | number | EmbeddedProperty
        md: string | number | EmbeddedProperty
        lg: string | number | EmbeddedProperty
        xl: string | number | EmbeddedProperty
        xxl: string | number | EmbeddedProperty
      }
    }
  }
}

@Component({
  selector: 'formly-wrapper-nz-form-field',
  templateUrl: './form-field.wrapper.html',
})
export class CvcFormFieldWrapper
  extends FieldWrapper<FormlyFieldConfig<CvcFormFieldWrapperProps>>
  implements OnInit
{
  defaultProps: CvcFormFieldWrapperProps = {
    layout: {
      label: {
        span: 4
      },
      control: {
        span: 20
      }
    },
  }

  ngOnInit(): void {
    this.props.layout = this.props.layout || this.defaultProps.layout
  }
  get errorState() {
    return this.showError ? 'error' : ''
  }
}
