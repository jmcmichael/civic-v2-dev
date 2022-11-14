import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field'
import { IndexableObject } from 'ng-zorro-antd/core/types'
import { NzFormLayoutType } from 'ng-zorro-antd/form'
import { NzAlign, NzJustify } from 'ng-zorro-antd/grid'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'

export interface CvcFormFieldWrapperLayout {
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
}

@UntilDestroy()
@Component({
  selector: 'cvc-form-field-wrapper',
  templateUrl: './form-field.wrapper.html',
  styleUrls: ['./form-field.wrapper.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcFormFieldWrapper
  extends FieldWrapper<FormlyFieldConfig>
  implements OnInit
{
  formLayout$!: BehaviorSubject<NzFormLayoutType>
  wrapper!: CvcFormFieldWrapperLayout

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
        // display: {
        //   tooltip: 'Field tooltip',
        //   description: 'Field description goes here.',
        //   noColon: true,
        //   ignoreRequiredState: false,
        //   ...(this.props.display
        //     ? this.props.wrapper.display
        //     : undefined),
        // },
        layout: {
          // layout only relevant for horizontal nzLayout type
          item: {
            gutter: [6, 12],
            ...(this.props.layout?.item ? this.props.layout.item : undefined),
          },
          label: {
            span: 4,
            ...(this.props.layout?.label ? this.props.layout.label : undefined),
          },
          control: {
            span: 20,
            ...(this.props.layout?.control
              ? this.props.layout?.control
              : undefined),
          },
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
