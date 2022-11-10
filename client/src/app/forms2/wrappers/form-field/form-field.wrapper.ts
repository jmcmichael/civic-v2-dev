import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core'
import { IndexableObject } from 'ng-zorro-antd/core/types'
import { NzFormLayoutType } from 'ng-zorro-antd/form'
import { NzAlign, NzJustify } from 'ng-zorro-antd/grid'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'
import { CvcFieldGroupWrapperConfig } from '../field-group/field-group.wrapper'

export type CvcFormFieldWrapperConfig = Partial<WrapperConfig>
export type CvcFormFieldFlowType = 'block' | 'inline'

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
    }
    control: {
      span: number
    }
  }
  group: CvcFieldGroupWrapperConfig
}

@UntilDestroy()
@Component({
  selector: 'cvc-form-field-wrapper',
  templateUrl: './form-field.wrapper.html',
  styleUrls: ['./form-field.wrapper.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcFormFieldWrapper
  extends FieldWrapper<FormlyFieldConfig<any>>
  implements OnInit
{
  wrapper!: WrapperConfig
  formLayout$!: BehaviorSubject<NzFormLayoutType>

  get errorState() {
    return this.showError ? 'error' : ''
  }

  constructor() {
    super()
  }

  ngOnInit(): void {
    // merge local wrapper config with field config specified properties
    try {
      this.wrapper = {
        display: {
          tooltip: 'Field tooltip',
          description: 'Field description goes here.',
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
        group: {
          ...(this.props.wrapper?.display
            ? this.props.wrapper.display
            : undefined),
        },
      }
    } catch (err) {
      console.error(err)
    }

    if (this.options.formState.formLayout$) {
      this.formLayout$ = this.options.formState.formLayout$
    } else {
      // emit default value
      this.formLayout$ = new BehaviorSubject<NzFormLayoutType>('vertical')
    }
  }
}
