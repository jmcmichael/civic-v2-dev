import { Component, OnDestroy, OnInit } from '@angular/core'
import { formatSourceTypeEnum } from '@app/core/utilities/enum-formatters/format-source-type-enum'
import {
  Maybe,
  SourceSource,
  SourceTypeaheadFieldsFragmentDoc,
} from '@app/generated/civic.apollo'
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core'
import { Subscribable, Subscription } from 'rxjs'
import { $enum } from 'ts-enum-util'

export interface SourceSelectModel {
  id: Maybe<number>
  sourceType: Maybe<SourceSource>
  citationId: Maybe<string>
}

@Component({
  selector: 'cvc-source-select',
  templateUrl: './source-select.type.html',
  styleUrls: ['./source-select.type.less'],
})
export class SourceSelectType extends FieldType<any> {
  private updateSub!: Subscription

  constructor() {
    super()

    this.defaultOptions = {
      templateOptions: {
        label: 'Source',
        entityType: 'Source',
        entityFragment: SourceTypeaheadFieldsFragmentDoc,
      },
      defaultValue: {
        sourceType: SourceSource.Pubmed,
        source: undefined,
      },
      fieldGroupClassName: 'select-group',
      fieldGroup: [
        {
          key: 'sourceType',
          type: 'select',
          className: 'type-field',
          templateOptions: {
            required: false,
            placeholder: 'Select Type',
            options: $enum(SourceSource).map((value, key) => {
              return { value: value, label: formatSourceTypeEnum(value) }
            }),
          },
          hideExpression: (
            model: any,
            formState: any,
            field?: FormlyFieldConfig
          ): boolean => {
            console.log(model)
            return model.source != undefined ? true : false
          },
        },
        {
          key: 'source',
          type: 'citation-select',
          className: 'citation-field',
          templateOptions: {
            required: false,
          },
          hideExpression: (
            model: any,
            formState: any,
            field?: FormlyFieldConfig
          ): boolean => {
            console.log(model)
            return model.source != undefined ? true : false
          },
        },
      ],
    }
  }
}
