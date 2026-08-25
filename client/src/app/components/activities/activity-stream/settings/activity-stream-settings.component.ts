import { ChangeDetectionStrategy, Component, input, model } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import {
  ActivityStreamScope,
  ActivityStreamSettings,
} from '../activity-stream.types'

/**
 * The stream's settings control: a gear button that opens a popover of
 * stream options — whether automated events appear, and whether items show
 * their organization tag. Every control change merges into `cvcSettings`
 * as a new object, so hosts observe each edit as a model change.
 */
@Component({
  selector: 'cvc-activity-stream-settings',
  imports: [
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzGridModule,
    NzPopoverModule,
  ],
  templateUrl: './activity-stream-settings.component.html',
  styleUrl: './activity-stream-settings.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcActivityStreamSettings {
  /** the stream's user-editable settings; every edit emits a new object */
  readonly cvcSettings = model.required<ActivityStreamSettings>()

  /** what the host scoped the stream to */
  readonly cvcScope = input.required<ActivityStreamScope>()

  /** merges a control change into the settings model, as a new object */
  patch(change: Partial<ActivityStreamSettings>): void {
    this.cvcSettings.update((settings) => ({ ...settings, ...change }))
  }
}
