import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core'

export type CvcFieldGroupWrapperConfig = Partial<GroupConfig>

type GroupConfig = {
  grid: {
    cols: 2 | 3 | 4
  }
}

@Component({
  selector: 'cvc-field-group',
  templateUrl: './field-group.wrapper.html',
  styleUrls: ['./field-group.wrapper.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcFieldGroupWrapper
  extends FieldWrapper<FormlyFieldConfig<any>>
  implements OnInit
{
  get errorState() {
    return this.showError ? 'error' : ''
  }

  ngOnInit(): void {
    // set default layout to grid, merge w/ any specified grid props
    this.props.grid = {
      cols: 2,
      ...(this.props.grid ? this.props.grid : undefined),
    }
  }
}
