import { Component, OnInit } from '@angular/core'
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field'

type QuerySubfiltersCardOptions = {
  isRootQuery?: boolean
}

export interface CvcQuerySubfiltersCardWrapperProps extends FormlyFieldProps {
  querySubfiltersCardOptions?: QuerySubfiltersCardOptions
}

const defaultWrapperOptions: QuerySubfiltersCardOptions = {
  isRootQuery: false,
}

@Component({
  selector: 'cvc-query-subfilters-card',
  templateUrl: './query-subfilters-card.wrapper.html',
  styleUrls: ['./query-subfilters-card.wrapper.less'],
  standalone: false,
})
export class CvcQuerySubfiltersCardWrapper
  extends FieldWrapper<FormlyFieldConfig<CvcQuerySubfiltersCardWrapperProps>>
  implements OnInit
{
  wrapperOptions: QuerySubfiltersCardOptions = { ...defaultWrapperOptions }

  get errorState() {
    return this.showError ? 'error' : ''
  }

  constructor() {
    super()
  }

  get operatorField(): FormlyFieldConfig | undefined {
    return this.field.fieldGroup?.find((f) => f.key === 'booleanOperator')
  }
  get subFiltersField(): FormlyFieldConfig | undefined {
    return this.field.fieldGroup?.find((f) => f.key === 'subFilters')
  }
  ngOnInit(): void {
    if (this.props.querySubfiltersCardOptions) {
      this.wrapperOptions = {
        ...this.wrapperOptions,
        ...this.props.querySubfiltersCardOptions,
      }
    }
  }
}
