import { Pipe, PipeTransform } from '@angular/core';
import { Maybe } from '@app/generated/civic.apollo';
import { getEvidenceEnumTooltip } from '../utilities/enum-tooltips/get-evidence-enum-tooltip';

@Pipe({
  name: 'enumTooltip',
  pure: true
})
export class EvidenceEnumTooltipPipe implements PipeTransform {
  transform(
    value?: string | symbol | number, // value of attribute
    name?: string | symbol, // name of entity attribute
    // optional contextual type (evidence/assertionType)
    contextType?: any,
    // optional contextual entity ('Assertion' or 'EvidenceType')
    contextEntity?: string
  ) {
    if(!name) return ''
    if(!value) return ''
    return getEvidenceEnumTooltip(name, value, contextType, contextEntity)
  }
}
