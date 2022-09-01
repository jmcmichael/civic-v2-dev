import { AfterViewInit, Component, OnInit, Type } from '@angular/core'
import { SelectOption } from '@app/forms2/states/entity.state'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import { EvidenceClinicalSignificance, EvidenceType, Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { BehaviorSubject, filter, Observable, Subject } from 'rxjs'
import { pluck } from 'rxjs-etc/operators'
import { tag } from 'rxjs-spy/operators'

interface CvcClinicalSignificanceSelectFieldProps extends FormlyFieldProps {
  placeholder: string
}

export interface CvcClinicalSignificanceSelectFieldConfig
  extends FormlyFieldConfig<CvcClinicalSignificanceSelectFieldProps> {
  type: 'evidence-type-select' | Type<CvcClinicalSignificanceSelectField>
}
@UntilDestroy()
@Component({
  selector: 'cvc-clinical-significance-select',
  templateUrl: './clinical-significance-select.type.html',
  styleUrls: ['./clinical-significance-select.type.less'],
})
export class CvcClinicalSignificanceSelectField
  extends FieldType<FieldTypeConfig<CvcClinicalSignificanceSelectFieldProps>>
  implements AfterViewInit
{
  // SOURCE STREAMS
  onModelChange$!: Observable<Maybe<EvidenceClinicalSignificance>>
  onValueChange$!: Subject<Maybe<EvidenceClinicalSignificance>>
  onEvidenceType$!: Subject<Maybe<EvidenceType>>

  // PRESENTATION STREAMS
  selectOption$!: BehaviorSubject<Maybe<SelectOption[]>>

  // OUTPUT STREAMS
  clinicalSignificanceChange$?: BehaviorSubject<Maybe<EvidenceClinicalSignificance>>

  state: Maybe<EvidenceState>
  constructor() {
    super()
  }

  ngAfterViewInit(): void {
    // create onModelChange$ observable from fieldChanges
    if (!this.field?.options?.fieldChanges) {
      console.error(
        `${this.field.key} field could not find fieldChanges Observable`
      )
    } else {
      this.onModelChange$ = this.field.options.fieldChanges.pipe(
        filter((c) => c.field.key === this.field.key), // filter out other fields
        tag('evidence-type-select onModelChange$'),
        pluck('value')
      )

      // emit value from onValueChange$ for every model change
      this.onModelChange$.pipe(untilDestroyed(this)).subscribe((v) => {
        this.onValueChange$.next(v)
      })
    }

    // set up input & output streams,
    if (this.field?.options?.formState) {
      this.state = this.field.options.formState
      // set up input stream
      if (this.state && this.state.options.clinicalSignificanceOption$) {
        this.selectOption$ = this.state.options.clinicalSignificanceOption$
      } else {
        console.error(
          `evidence-type-select field could not find form state's clinicalSignificanceOption$ to populate select.`
        )
      }

      // set up output stream
      if (this.state && this.state.fields.clinicalSignificance$) {
        this.clinicalSignificanceChange$ = this.state.fields.clinicalSignificance$
        this.onValueChange$
          .pipe(
            tag('evidence-type-select clinicalSignificanceChange$'),
            untilDestroyed(this)
          )
          .subscribe((v) => {
            if (this.clinicalSignificanceChange$) this.clinicalSignificanceChange$.next(v)
          })
      }
    }
  }
}
