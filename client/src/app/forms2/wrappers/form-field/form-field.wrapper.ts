import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core'
import { IndexableObject } from 'ng-zorro-antd/core/types'
import { NzFormLayoutType } from 'ng-zorro-antd/form'
import { EmbeddedProperty, NzAlign, NzJustify } from 'ng-zorro-antd/grid'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'

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
  host: {
    '[class.layout-horizontal]': `formLayout === 'horizontal'`,
    '[class.layout-vertical]': `formLayout === 'vertical'`,
    '[class.layout-inline]': `formLayout === 'inline'`,
  }
})
export class CvcFormFieldWrapper
  extends FieldWrapper<FormlyFieldConfig<any>>
  implements OnInit
{
  wrapper!: WrapperConfig
  formLayout$!: BehaviorSubject<NzFormLayoutType>
  formLayout: NzFormLayoutType = 'horizontal'
  get errorState() {
    return this.showError ? 'error' : ''
  }

  constructor() {
    super()
  }

  ngOnInit(): void {
    if (this.options.formState.formLayout$) {
      this.options.formState.formLayout$
        .pipe(untilDestroyed(this))
        .subscribe((layout: NzFormLayoutType) => {
          this.formLayout = layout
        })
      this.formLayout$ = this.options.formState.formLayout$
    } else {
      this.formLayout$ = new BehaviorSubject<NzFormLayoutType>('horizontal')
    }

    // merge the defaults below w/ any field.props specified display, layout settings
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
      }
    } catch (err) {
      console.error(err)
    }
  }
}
