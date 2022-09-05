import { AfterViewInit, Component, OnInit, TemplateRef, Type } from '@angular/core'
import { GeneSelectGQL, Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy } from '@ngneat/until-destroy'
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { Observable, Subject } from 'rxjs'

interface CvcGeneSelectFieldProps extends FormlyFieldProps {
  placeholder: string
  optionTpl: TemplateRef<any>
}

export interface CvcGeneSelectFieldConfig
  extends FormlyFieldConfig<CvcGeneSelectFieldProps> {
  type: 'gene-select' | Type<CvcGeneSelectField>
}

@UntilDestroy()
@Component({
  selector: 'cvc-gene-select',
  templateUrl: './gene-select.type.html',
  styleUrls: ['./gene-select.type.less'],
})
export class CvcGeneSelectField
  extends FieldType<FieldTypeConfig<CvcGeneSelectFieldProps>>
  implements AfterViewInit
{
  // SOURCE STREAMS
  onModelChange$!: Observable<Maybe<number>> // emits all field model changes
  onValueChange$: Subject<Maybe<number>> // emits on model changes, and other model update sources (query param, or other pre-init model value)

  selectGql: GeneSelectGQL
  constructor(private geneSelectGql: GeneSelectGQL) {
    super()
    this.onValueChange$ = new Subject<Maybe<number>>()
    this.selectGql = this.geneSelectGql
  }

  ngAfterViewInit(): void {}
}
