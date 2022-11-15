import {
  AfterViewInit,
  Component,
  QueryList,
  TemplateRef,
  Type,
  ViewChildren,
} from '@angular/core'
import { BaseFieldType } from '@app/forms2/mixins/base/base-field'
import { EnumTagField } from '@app/forms2/mixins/enum-tag-field.mixin'
import { Maybe } from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { BehaviorSubject, map, Subject } from 'rxjs'
import mixin from 'ts-mixin-extended'

const optionText: { [option: string]: string } = {
  1: 'Poor - Claim is not supported well by experimental evidence. Results are not reproducible, or have very small sample size. No follow-up is done to validate novel claims.',
  2: 'Adequate - Evidence is not well supported by experimental data, and little follow-up data is available. Experiments may lack proper controls, have small sample size, or are not statistically convincing.',
  3: 'Average - Evidence is convincing, but not supported by a breadth of experiments. May be smaller scale projects, or novel results without many follow-up experiments. Discrepancies from expected results are explained and not concerning.',
  4: 'Strong - Well supported evidence. Experiments are well controlled, and results are convincing. Any discrepancies from expected results are well-explained and not concerning.',
  5: 'Excellent - Solid, well supported evidence from a lab or journal with respected academic standing. Experiments are well controlled, and results are clean and reproducible across multiple replicates. Evidence confirmed using separate methods.',
}

export type CvcRatingSelectFieldOptions = Partial<
  FieldTypeConfig<CvcRatingSelectFieldProps>
>

interface CvcRatingSelectFieldProps extends FormlyFieldProps {
  label: string
  description?: string
  tooltip?: string
}

export interface CvcRatingSelectFieldConfig
  extends FormlyFieldConfig<CvcRatingSelectFieldProps> {
  type: 'rating-select' | Type<CvcRatingSelectField>
}

const RatingSelectMixin = mixin(
  BaseFieldType<FieldTypeConfig<CvcRatingSelectFieldProps>, Maybe<number>>(),
  EnumTagField<number, number>()
)

@Component({
  selector: 'cvc-rating-select',
  templateUrl: './rating-select.type.html',
  styleUrls: ['./rating-select.type.less'],
})
export class CvcRatingSelectField
  extends RatingSelectMixin
  implements AfterViewInit
{
  // LOCAL SOURCE STREAMS
  rating$: BehaviorSubject<Maybe<number>>
  hover$: Subject<number>

  // LOCAL INTERMEDIATE STREAMS
  // LOCAL PRESENTATION STREAMS
  label$!: BehaviorSubject<string>

  // FieldTypeConfig defaults
  defaultOptions: CvcRatingSelectFieldOptions = {
    props: {
      label: 'Evidence Rating',
      tooltip: `An evaluation of the curator's confidence in the quality of the summarized evidence`,
    },
  }

  constructor() {
    super()
    this.rating$ = new BehaviorSubject<Maybe<number>>(undefined)
    this.hover$ = new Subject<number>()
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureStateConnections() // local fn
    this.rating$
      .pipe(untilDestroyed(this))
      .subscribe((rating: Maybe<number>) => {
        this.formControl.setValue(rating)
        if (!rating) {
          this.props.description = undefined
        } else {
          this.props.description = optionText[rating]
        }
      })
    // TODO: figure out how to clear description if rating component isn't hovered (couldn't get nzOnBlur emitter to work)
    this.hover$.pipe(untilDestroyed(this)).subscribe((rating: number) => {
      this.props.description = optionText[rating]
    })
  }

  configureStateConnections(): void {
    // update field description on value changes
    this.onValueChange$
      .pipe(untilDestroyed(this))
      .subscribe((rating: Maybe<number>) => {
        if (!rating) {
          this.props.description = undefined
        } else {
          this.props.description = optionText[rating]
        }
      })
  }
}
