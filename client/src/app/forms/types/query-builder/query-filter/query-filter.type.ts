// query-filter.type.ts
import { Component, OnInit } from '@angular/core'
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core'
import { BooleanOperator } from '@app/generated/civic.apollo'
import { AdvancedSearchEndpoint } from '@app/forms/config/query-builder/query-builder.types'
import { getFieldOptions } from '@app/forms/config/query-builder/field-config/functions/get-field-options'
import { getSelectOptions } from '@app/forms/config/query-builder/field-config/functions/get-select-options'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'

@UntilDestroy()
@Component({
  selector: 'query-filter',
  templateUrl: './query-filter.type.html',
  styleUrl: './query-filter.type.less',
  standalone: false,
}) //, AfterViewInit
export class CvcQueryFilterField
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  constructor() {
    super()
  }
  /**
   * Depth of this query-filter row in the recursion tree.
   *  - 0 = root (direct child of query.subFilters)
   *  - 1+ = nested under a recursive filter (e.g. disease.subFilters)
   */
  get depth(): number {
    return (this.props.depth as number) ?? 0
  }

  ngOnInit(): void {
    // build [fieldKey, input] once
    if (!this.field.fieldGroup || this.field.fieldGroup.length === 0) {
      console.log(`** ${this.field.key}-query-filter OnInit ----------`)
      this.buildFieldGroup()
    }

    // apply initial input config from existing model (permalink)
    this.updateInputFieldGroup()

    // react to changes in the row model (especially fieldKey)
    // NOTE: here formControl.value IS the row object:
    // { id, fieldKey, input }
    this.formControl.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateInputFieldGroup()
    })
  }

  private getFieldOptionsFromProps(): FormlyFieldConfig[] {
    const fromSelf = this.props.fieldOptions as FormlyFieldConfig[] | undefined
    const fromParent = this.field.parent?.props?.fieldOptions as
      | FormlyFieldConfig[]
      | undefined
    return fromSelf ?? fromParent ?? []
  }

  /**
   * Build the two-child fieldGroup:
   *  - fieldKey: select of all available fields
   *  - input: dynamic body based on fieldKey (leaf SearchInput or nested filter)
   */
  private buildFieldGroup() {
    console.log(`** ${this.field.key}-query-filter buildFieldGroup()`)
    const fieldOptions = this.getFieldOptionsFromProps()

    const fieldKeyField: FormlyFieldConfig = {
      key: 'fieldKey',
      type: 'base-select',
      props: {
        required: true,
        placeholder: 'Select field…',
        options: fieldOptions.map((opt) => ({
          label: opt.props?.label ?? String(opt.key),
          value: opt.key,
        })),
      },
    }

    const inputField: FormlyFieldConfig = {
      key: 'input',
      type: 'formly-group',
      wrappers: ['form-row'],
      fieldGroup: [],
    }
    if (this.options.build) {
      this.field.fieldGroup = [fieldKeyField, inputField].map((fc) => {
        return this.options.build!(fc)
      })
    }
    console.log(
      `** ${this.field.key}-query-filter field.fieldGroup`,
      this.field.fieldGroup
    )
  }

  /**
   * Called on init and whenever the row's value changes.
   * Uses the *row* value from this.formControl (not field.model).
   */
  private updateInputFieldGroup() {
    console.log(`** ${this.field.key}-query-filter updateInputFieldGroup()`)
    const rowValue = (this.formControl.value ?? {}) as {
      fieldKey?: string
      input?: any
    }

    const selectedKey = rowValue.fieldKey
    const [_, inputField] = this.field.fieldGroup ?? []

    if (!inputField) return

    // generate new input fieldGroup for input
    inputField.fieldGroup = this.buildInputFieldGroup(
      this.field,
      selectedKey ?? undefined
    )

    // rebuild controls for the new input subtree
    this.options?.build?.(inputField)
  }

  /**
   * Compute the fieldGroup for the `input` container, based on the selected fieldKey.
   */
  private buildInputFieldGroup(
    rowField: FormlyFieldConfig,
    selectedKey: string | undefined
  ): FormlyFieldConfig[] {
    if (!selectedKey) return []

    const fieldOptions = (rowField.props?.fieldOptions ??
      rowField.parent?.props?.fieldOptions ??
      []) as FormlyFieldConfig[]

    const descriptor = fieldOptions.find((opt) => opt.key === selectedKey)
    if (!descriptor) return []

    const isRecursive = descriptor.props?.isRecursive
    const filterEndpoint = descriptor.props?.filterEndpoint as
      | AdvancedSearchEndpoint
      | undefined

    if (isRecursive && filterEndpoint) {
      // nested normalized filter: { booleanOperator, subFilters }
      return this.makeNestedFilterBody(filterEndpoint)
    }

    // leaf field: descriptor.fieldGroup describes the SearchInput
    return descriptor.fieldGroup ?? []
  }

  /**
   * Build a nested filter body for a recursive field:
   *
   * input: {
   *   booleanOperator: BooleanOperator
   *   subFilters: NormalizedSubFilter<ChildFilter>[]
   * }
   */
  private makeNestedFilterBody(
    endpoint: AdvancedSearchEndpoint
  ): FormlyFieldConfig[] {
    const childFieldOptions = getFieldOptions(endpoint)

    return [
      {
        key: 'booleanOperator',
        type: 'base-radio',
        props: {
          required: true,
          size: 'small',
          type: 'button',
          options: getSelectOptions('BooleanOperator'),
        },
      },
      {
        key: 'subFilters',
        type: 'query-subfilters',
        props: {
          fieldOptions: childFieldOptions,
        },
        fieldArray: {
          type: 'query-filter',
          resetOnHide: true,
          props: {
            fieldOptions: childFieldOptions,
            size: 'small',
            depth: this.depth + 1,
          },
        },
      },
    ]
  }
}
