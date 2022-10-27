import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core'
import { IndexableObject } from 'ng-zorro-antd/core/types'
import { EmbeddedProperty, NzAlign, NzJustify } from 'ng-zorro-antd/grid'

export type CvcFieldLayoutWrapperConfig = Partial<WrapperConfig>

type WrapperConfig = {
  display: {
    ignoreRequiredState: boolean
    noColon: boolean
    hideLabel?: boolean
    tooltip?: string
    description?: string
  }
  layout: {
    item: {
      gutter:
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
  styleUrls: ['./form-field.wrapper.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcFormFieldWrapper
  extends FieldWrapper<FormlyFieldConfig<any>>
  implements OnInit
{
  wrapper!: WrapperConfig

  get errorState() {
    return this.showError ? 'error' : ''
  }

  constructor() {
    super()
  }

  ngOnInit(): void {
    // merge the defaults below w/ any field.props specified display, layout settings
    try {
      this.wrapper = {
        display: {
          noColon: true,
          ignoreRequiredState: false,
          ...(this.props.wrapper?.display
            ? this.props.wrapper.display
            : undefined),
        },
        layout: {
          item: {
            gutter: [6, 12],
            ...(this.props.wrapper?.layout?.item
              ? this.props.wrapper.layout.item
              : undefined),
          },
          label: {
            span: 4,
            ...(this.props.wrapper?.layout?.label
              ? this.props.wrapper.layout.label
              : undefined),
          },
          control: {
            span: 20,
            ...(this.props.wrapper?.layout?.control
              ? this.props.wrapper.layout?.control
              : undefined),
          },
        },
      }
    } catch (err) {
      console.error(err)
    }
  }


}
