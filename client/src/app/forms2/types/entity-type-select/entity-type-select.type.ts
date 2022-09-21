import { AfterViewInit, Component, OnInit, Type } from '@angular/core'
import { EntityType } from '@app/forms/config/states/entity.state'
import { EntityState, SelectOption } from '@app/forms2/states/entity.state'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import { Maybe } from '@app/generated/civic.apollo'
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

interface CvcEntityTypeSelectFieldProps extends FormlyFieldProps {
  placeholder: string
}

export interface CvcEntityTypeSelectFieldConfig
  extends FormlyFieldConfig<CvcEntityTypeSelectFieldProps> {
  type: 'entity-type-select' | Type<CvcEntityTypeSelectField>
}
@UntilDestroy()
@Component({
  selector: 'cvc-entity-type-select',
  templateUrl: './entity-type-select.type.html',
  styleUrls: ['./entity-type-select.type.less'],
})
export class CvcEntityTypeSelectField
  extends FieldType<FieldTypeConfig<CvcEntityTypeSelectFieldProps>>
  implements AfterViewInit
{
  defaultOptions: Partial<FieldTypeConfig<CvcEntityTypeSelectFieldProps>> = {
    props: {
      label: 'Evidence Type',
      placeholder: 'Select an Evidence Type',
    },
  }

  // SOURCE STREAMS
  onModelChange$!: Observable<Maybe<EntityType>>
  onValueChange$!: Subject<Maybe<EntityType>>

  // PRESENTATION STREAMS
  selectOption$!: BehaviorSubject<SelectOption[]>

  // OUTPUT STREAMS
  evidenceTypeChange$?: BehaviorSubject<Maybe<EntityType>>

  state: Maybe<EntityState>

  constructor() {
    super()
    this.onValueChange$ = new Subject<Maybe<EntityType>>()
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
        // tag('entity-type-select onModelChange$'),
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
      if (this.state && this.state.options.evidenceTypeOption$) {
        this.selectOption$ = this.state.options.evidenceTypeOption$
      } else {
        console.error(
          `evidence-type-select field could not find form state's evidenceTypeOption$ to populate select.`
        )
      }

      // set up output stream
      if (this.state && this.state.fields.evidenceType$) {
        this.evidenceTypeChange$ = this.state.fields.evidenceType$
        this.onValueChange$
          .pipe(
            // tag('entity-type-select evidenceTypeChange$'),
            untilDestroyed(this)
          )
          .subscribe((v) => {
            if (this.evidenceTypeChange$) this.evidenceTypeChange$.next(v)
          })
      }
    }
  }
}
