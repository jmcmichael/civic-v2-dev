import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyAttributeEvent } from '@ngx-formly/core/lib/models'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import {
  asyncScheduler,
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  skip,
  startWith,
  Subject,
  throttleTime,
} from 'rxjs'
import { mergeArray } from 'rxjs-etc'
import { startWithDeferred } from 'rxjs-etc/dist/esm/operators'
import { tag } from 'rxjs-spy/operators'

export type CvcSelectEntityName = { singular: string; plural: string }

export type CvcEntitySelectMessageMode =
  | 'idle'
  | 'open'
  | 'loading'
  | 'empty'
  | 'query'

type SelectMessageFn = (
  entityName: string,
  searchStr: string,
  paramName?: string
) => string

export type EntitySelectMessageOptions = {
  search: SelectMessageFn
  searchAll: SelectMessageFn
  searchParam: SelectMessageFn
  searchParamAll: SelectMessageFn
  empty: SelectMessageFn
  emptyParam: SelectMessageFn
  emptyParamAll: SelectMessageFn
}

@UntilDestroy({ arrayName: 'stateSubscriptions' })
@Component({
  selector: 'cvc-entity-select',
  templateUrl: './entity-select.component.html',
  styleUrls: ['./entity-select.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcEntitySelectComponent implements OnChanges, AfterViewInit {
  @Input() cvcFormControl!: FormControl
  @Input() cvcFormlyAttributes!: FormlyFieldConfig
  @Input() cvcEntityName: CvcSelectEntityName = {
    singular: 'Entity',
    plural: 'Entities',
  }
  @Input() cvcSelectMessages?: EntitySelectMessageOptions
  @Input() cvcSelectMode: 'multiple' | 'tags' | 'default' = 'default'
  @Input() cvcPlaceholder?: string
  @Input() cvcLoading?: boolean = false
  @Input() cvcOptions: NzSelectOptionInterface[] | undefined = undefined
  @Input() cvcResults?: any[]
  @Input() cvcShowError: boolean = false
  @Input() cvcDisabled?: boolean = false
  @Input() cvcAllowClear: boolean = true
  @Input() cvcBorderless?: boolean = false
  @Input() cvcShowArrow?: boolean
  @Input() cvcAutoClearSearchValue: boolean = true

  // custom template for field value render
  @Input() cvcCustomTemplate?: TemplateRef<any> | null = null

  // additional content displayed at bottom of options dropdown
  @Input() cvcDropdownExtra?: TemplateRef<any> | null = null

  // name of entity specified by optional param value, for constructing messages
  @Input() cvcParamName?: string | undefined

  // templateref w/ entity's quick-add form component
  @Input() cvcAddEntity: TemplateRef<any> | null = null

  // model update callback fn - ngx-formly convention, implements props.change feature
  @Input() cvcModelChange?: FormlyAttributeEvent

  @Output() cvcOnOpenChange = new EventEmitter<boolean>()

  // throttle search string output: wait 1/3sec after typing activity ends,
  // quash leading event, emit trailing event so we only get 1 search string
  @Output() cvcOnSearch = new EventEmitter<string>().pipe(
    throttleTime(300, asyncScheduler, { leading: false, trailing: true })
  ) as EventEmitter<string>

  // SOURCE STREAMS
  onSearchMessage$: Observable<Maybe<string>>
  onParamName$: Subject<Maybe<string>>
  onOption$: Subject<Maybe<NzSelectOptionInterface[]>>

  message: Maybe<string>

  messageOptions: EntitySelectMessageOptions = {
    search: (entityName, query, _paramName) =>
      `Searching ${entityName} matching "${query}""...`,
    searchAll: (entityName, _query, _paramName) =>
      `Listing all ${entityName}...`,
    searchParam: (entityName, query, paramName) =>
      `Searching ${paramName} ${entityName} matching "${query}""...`,
    searchParamAll: (entityName, _query, paramName) =>
      `Listing all ${paramName} ${entityName}...`,
    empty: (entityName, query) => `No ${entityName} found matching "${query}"`,
    emptyParam: (entityName, query, paramName) =>
      `No ${paramName} ${entityName} found matching "${query}"`,
    emptyParamAll: (entityName, _query, paramName) =>
      `No ${paramName} ${entityName} found`,
  }

  constructor(private cdr: ChangeDetectorRef) {
    this.onSearchMessage$ = new Subject<Maybe<string>>()
    this.onParamName$ = new Subject<Maybe<string>>()
    this.onOption$ = new Subject<Maybe<NzSelectOptionInterface[]>>()
    this.message = 'LOADING'
  }

  ngAfterViewInit(): void {
    this.cvcOnOpenChange.pipe(tag('entity-select onOpenChange$')).subscribe()
    this.cvcOnSearch.pipe(tag('entity-select cvcOnSearch$')).subscribe()
    this.onParamName$.pipe(tag('entity-select onParamName$')).subscribe()
    this.onOption$.pipe(tag('entity-select onOption$')).subscribe()

    // produce appropriate dropdown messages by combining relevant observables.
    // prime combineLatest with startWith values
    this.onSearchMessage$ = combineLatest([
      this.cvcOnOpenChange.pipe(startWithDeferred(() => false)),
      this.cvcOnSearch.pipe(startWithDeferred(() => undefined)),
      this.onParamName$.pipe(startWithDeferred(() => undefined)),
      this.onOption$.pipe(startWithDeferred(() => undefined)),
    ]).pipe(
      map(
        ([isOpen, searchStr, paramName, options]: [
          boolean,
          Maybe<string>,
          Maybe<string>,
          Maybe<NzSelectOptionInterface[]>
        ]) => {
          console.log(
            'isOpen:',
            isOpen,
            'searchStr:',
            JSON.stringify(searchStr),
            'paramName:',
            paramName,
            'options:',
            options
          )
          if (paramName === undefined) {
            if (!isOpen && searchStr === undefined && options === undefined) {
              return 'INIT'
            }
            if (isOpen && searchStr === undefined && options === undefined) {
              return 'INITIAL SELECT CLICK'
            }
            if (
              isOpen &&
              searchStr !== undefined &&
              searchStr.length === 0 &&
              options === undefined
            ) {
              return 'INITIAL SELECT STR'
            }
            if (
              isOpen &&
              searchStr !== undefined &&
              searchStr.length === 0 &&
              options !== undefined &&
              options.length > 0
            ) {
              return 'QUERY "" RESULTS RETURNED'
            }
            if (
              isOpen &&
              searchStr !== undefined &&
              searchStr.length > 0 &&
              options !== undefined &&
              options.length > 0
            ) {
              return 'QUERY STR RESULTS RETURNED'
            }
            if (
              isOpen &&
              searchStr !== undefined &&
              searchStr.length === 0 &&
              options !== undefined &&
              options.length === 0
            ) {
              return 'QUERY "", NO RESULTS'
            }
            if (
              isOpen &&
              searchStr !== undefined &&
              searchStr.length > 0 &&
              options !== undefined &&
              options.length === 0
            ) {
              return 'QUERY STR, NO RESULTS'
            }
            if (
              !isOpen &&
              searchStr !== undefined &&
              searchStr.length === 0 &&
              options !== undefined
            ) {
              return 'CLOSED AFTER QUERY'
            }
          }
          return 'DEFAULT MSG'
        }
      )
    )

    this.onSearchMessage$
      .pipe(tag('entity-select onSearchMessage$'), untilDestroyed(this))
      .subscribe((message) => {
        this.message = message
      })
  } // ngAfterViewInit()

  getSearchMessage(searchStr: string, paramName?: string): string {
    const plName = this.cvcEntityName.plural
    if (paramName && searchStr.length > 0) {
      return this.messageOptions.searchParam(plName, searchStr, paramName)
    } else if (!paramName && searchStr.length > 0) {
      return this.messageOptions.search(plName, searchStr, paramName)
    } else if (paramName && searchStr.length === 0) {
      return this.messageOptions.searchParamAll(plName, searchStr, paramName)
    } else {
      return `Searching ${plName}...`
    }
  }

  getEmptyMessage(searchStr: string, paramName?: string): string {
    const plName = this.cvcEntityName.plural
    if (paramName && searchStr.length > 0) {
      return this.messageOptions.emptyParam(plName, searchStr, paramName)
    } else if (paramName && searchStr.length === 0) {
      return this.messageOptions.emptyParamAll(plName, searchStr, paramName)
    } else {
      return this.messageOptions.empty(plName, searchStr)
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cvcParamName) {
      this.onParamName$.next(changes.cvcParamName.currentValue)
    }
    if (changes.cvcOptions) {
      const options = changes.cvcOptions.currentValue
      this.onOption$.next(options)
    }
  }
}
