import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  TrackByFunction,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyAttributeEvent } from '@ngx-formly/core/lib/models'
import { BehaviorSubject, Observable, Subject } from 'rxjs'

@UntilDestroy()
@Component({
  selector: 'cvc-entity-select',
  templateUrl: './entity-select.component.html',
  styleUrls: ['./entity-select.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcEntitySelectComponent {
  @Input() cvcFormControl!: FormControl
  @Input() cvcFormlyAttributes!: FormlyFieldConfig
  @Input() cvcShowError: boolean = false
  @Input() cvcDisabled?: boolean = false
  @Input() cvcAllowClear: boolean = true
  @Input() cvcLoading?: boolean = false
  @Input() cvcResults: any[] | undefined
  @Input() cvcNotFound: string | TemplateRef<any> | undefined = undefined
  @Input() cvcOptionExtra: TemplateRef<any> | null = null
  @Input() cvcSearchMinLength: number = 1
  @Input() cvcOptionTrackBy!: TrackByFunction<any>
  @Input() cvcModelChange?: FormlyAttributeEvent

  _placeholder = new BehaviorSubject<string>('')
  @Input()
  set cvcPlaceholder(p: string | BehaviorSubject<string>) {
    if (typeof p === 'string') this._placeholder.next(p)
    else {
      this._placeholder = p
    }
  }

  @Output() readonly cvcOnSearch = new EventEmitter<string>()
  @Output() readonly cvcOnFocus = new EventEmitter<void>()
  get cvcPlaceholder(): BehaviorSubject<string> {
    return this._placeholder
  }
  searchString?: string
  constructor() {
    this.cvcOnSearch
      .pipe(untilDestroyed(this))
      .subscribe((s) => (this.searchString = s))
  }

  onSearch(str: string) {
    // send search str if greater than or equal to specified min length
    if (str.length >= this.cvcSearchMinLength) this.cvcOnSearch.next(str)
    // clear results if search string less than min length and results exist
    if (
      str.length < this.cvcSearchMinLength &&
      this.cvcResults &&
      this.cvcResults.length > 0
    )
      this.cvcResults = undefined
  }
}
