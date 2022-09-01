import { AfterViewInit, Component, OnInit, Type } from '@angular/core'
import { SelectOption } from '@app/forms2/states/entity.state'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import {
  EvidenceClinicalSignificance,
  EvidenceType,
  Maybe,
} from '@app/generated/civic.apollo'
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
  label: string
  placeholder: string
  requireType: true
  requireTypePrompt: string
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
  placeholder$!: BehaviorSubject<string>

  // OUTPUT STREAMS
  clinicalSignificanceChange$?: BehaviorSubject<
    Maybe<EvidenceClinicalSignificance>
  >

  state: Maybe<EvidenceState>

  // FieldTypeConfig defaults
  defaultOptions: Partial<
    FieldTypeConfig<CvcClinicalSignificanceSelectFieldProps>
  > = {
    props: {
      label: 'Clinical Significance',
      placeholder: 'Select a Clinical Significance',
      requireType: true,
      requireTypePrompt: 'Select an Evidence Type to select Significance',
    },
  }
  constructor() {
    super()
  }

  ngAfterViewInit(): void {
    // show prompt to select a Type if requireType true
    // otherwise show standard placeholder
    const initialPlaceholder: string = this.props.requireType
      ? this.props.requireTypePrompt
      : this.props.placeholder
    this.placeholder$ = new BehaviorSubject<string>(initialPlaceholder)

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
      // set up input streams
      if (this.state && this.state.options.clinicalSignificanceOption$) {
        this.selectOption$ = this.state.options.clinicalSignificanceOption$
      } else {
        console.error(
          `clinical-significance-select field could not find form state's clinicalSignificanceOption$ to populate select.`
        )
      }

      if (this.state && this.state.fields.evidenceType$) {
        this.onEvidenceType$ = this.state.fields.evidenceType$
        this.onEvidenceType$
          .pipe(untilDestroyed(this))
          .subscribe((et: Maybe<EvidenceType>) => {
            if (!et && this.props.requireType) {
              this.placeholder$.next(this.props.requireTypePrompt)
            } else {
              this.placeholder$.next(this.props.placeholder)
            }
          })
      } else {
        console.error(
          `clinical-significance-select field could not find form state's evidenceType$.`
        )
      }

      // set up output stream
      if (this.state && this.state.fields.clinicalSignificance$) {
        this.clinicalSignificanceChange$ =
          this.state.fields.clinicalSignificance$
        this.onValueChange$
          .pipe(
            tag('evidence-type-select clinicalSignificanceChange$'),
            untilDestroyed(this)
          )
          .subscribe((v) => {
            if (this.clinicalSignificanceChange$)
              this.clinicalSignificanceChange$.next(v)
          })
      }
    }
  }
}
