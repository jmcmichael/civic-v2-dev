import { Pipe, PipeTransform } from '@angular/core'
import { enumLabelOverride } from '@app/core/utilities/enum-formatters/format.common'

@Pipe({
  name: 'enumToTitle',
  pure: true,
  standalone: false,
})
export class EnumToTitlePipe implements PipeTransform {
  transform(enum_text?: string): string {
    if (enum_text) {
      const override = enumLabelOverride(enum_text)
      if (override) {
        return override
      }
      if (enum_text === 'POSITIVE') {
        return '+'
      }
      if (enum_text === 'NEGATIVE') {
        return '-'
      }
      if (enum_text === 'DESC') {
        return 'Descending'
      }
      if (enum_text === 'ASC') {
        return 'Ascending'
      }
      if (enum_text.includes('FIVE_PRIME')) {
        enum_text = enum_text.replace('FIVE_PRIME', "5'")
      } else if (enum_text.includes('THREE_PRIME')) {
        enum_text = enum_text.replace('THREE_PRIME', "3'")
      }
      let str = enum_text.toLowerCase().replace(/_/g, ' ').split(' ')
      for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1)
      }
      return str.join(' ')
    } else {
      return ''
    }
  }
}
