import { AfterViewInit, Component, OnInit, Type } from '@angular/core'
import { SelectOption } from '@app/forms2/states/entity.state'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import { EvidenceDirection, EvidenceType, Maybe } from '@app/generated/civic.apollo'
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

interface CvcEvidenceDirectionSelectFieldProps extends FormlyFieldProps {
  placeholder: string
  requireType: boolean
  requireTypePrompt: string
}

export interface CvcEvidenceDirectionSelectFieldConfig
  extends FormlyFieldConfig<CvcEvidenceDirectionSelectFieldProps> {
  type: 'evidence-type-select' | Type<CvcEvidenceDirectionSelectField>
}

@UntilDestroy()
@Component({
  selector: 'cvc-evidence-direction-select',
  templateUrl: './evidence-direction-select.type.html',
  styleUrls: ['./evidence-direction-select.type.less'],
})
export class CvcEvidenceDirectionSelectField
  extends FieldType<FieldTypeConfig<CvcEvidenceDirectionSelectFieldProps>>
  implements AfterViewInit
{
  defaultOptions: Partial<FieldTypeConfig<CvcEvidenceDirectionSelectFieldProps>> = {
    props: {
      label: 'Evidence Type',
      placeholder: 'Select an Evidence Direction',
      requireType: true,
      requireTypePrompt: 'Select an Evidence Type to choose Direction'
    },
  }

  // SOURCE STREAMS
  onModelChange$!: Observable<Maybe<EvidenceDirection>>
  onValueChange$!: Subject<Maybe<EvidenceDirection>>
  onEvidenceType$!: Subject<Maybe<EvidenceType>>

  // PRESENTATION STREAMS
  selectOption$!: BehaviorSubject<Maybe<SelectOption[]>>
  placeholder$!: BehaviorSubject<string>

  // OUTPUT STREAMS
  evidenceDirectionChange$?: BehaviorSubject<Maybe<EvidenceDirection>>

  state: Maybe<EvidenceState>

  constructor() {
    super()
    this.onValueChange$ = new Subject<Maybe<EvidenceDirection>>()
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
      // set up input stream
      if (this.state && this.state.options.evidenceDirectionOption$) {
        this.selectOption$ = this.state.options.evidenceDirectionOption$
      } else {
        console.error(
          `evidence-type-select field could not find form state's evidenceDirectionOption$ to populate select.`
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
          `evidence-direction-select field could not find form state's evidenceType$.`
        )
      }

      // set up output stream
      if (this.state && this.state.fields.evidenceDirection$) {
        this.evidenceDirectionChange$ = this.state.fields.evidenceDirection$
        this.onValueChange$
          .pipe(
            tag('evidence-type-select evidenceDirectionChange$'),
            untilDestroyed(this)
          )
          .subscribe((v) => {
            if (this.evidenceDirectionChange$) this.evidenceDirectionChange$.next(v)
          })
      }
    }
  }
}
