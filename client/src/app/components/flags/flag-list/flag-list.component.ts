import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { FlagFragment } from '@app/components/flags/flag-list-and-filter/flag-list-and-filter.gql.generated'

@Component({
  selector: 'cvc-flag-list',
  templateUrl: './flag-list.component.html',
  styleUrls: ['./flag-list.component.less'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class FlagListComponent {
  @Input() flags!: FlagFragment[]
  @Input() flagResolvedCallback?: () => void
}
