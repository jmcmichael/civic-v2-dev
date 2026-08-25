import { animate, state, style, transition, trigger } from '@angular/animations'
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Type,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo.types'
import {
  PolymorpheusComponent,
  PolymorpheusOutlet,
} from '@taiga-ui/polymorpheus'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import {
  CvcStreamItemContext,
  CvcStreamItemKindSpec,
  CvcStreamItemSpec,
} from './entity-stream.types'
import { CvcStreamScrollState } from './scroll/stream-scroll-state'
import { CvcStreamState } from './stream-state'

/**
 * The generic item shell: one card per item, holding the selection checkbox,
 * the expand toggle, the summary/extra/footer outlets and the animated
 * detail region. Everything the shell renders through an outlet is facade
 * content from the item spec; the shell owns only the mechanics.
 *
 * Expansion and selection are read from and written to the stream's
 * `CvcStreamState`, keyed by item id, so both survive the virtual scroller
 * recycling this view.
 */
@Component({
  selector: 'cvc-stream-item',
  templateUrl: './stream-item.component.html',
  styleUrl: './stream-item.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('details', [
      state('hidden', style({ height: 0, 'overflow-y': 'hidden' })),
      state('visible', style({ height: '*', 'overflow-y': 'hidden' })),
      transition('visible <=> hidden', animate('.25s ease-out')),
      transition('hidden <=> visible', animate('.25s ease-in')),
    ]),
  ],
  imports: [
    NzCardModule,
    NzCheckboxModule,
    NzIconModule,
    NzSkeletonModule,
    NzTooltipModule,
    PolymorpheusOutlet,
  ],
})
export class CvcStreamItemComponent<TItem> {
  item = input.required<TItem>()
  itemSpec = input.required<CvcStreamItemSpec<TItem>>()

  private readonly scroll = inject(CvcStreamScrollState)
  private readonly state = inject(CvcStreamState)
  private readonly injector = inject(Injector)

  protected readonly id = computed(() => this.itemSpec().id(this.item()))
  protected readonly kind = computed(() => this.itemSpec().kind(this.item()))
  protected readonly kindSpec = computed<
    Maybe<CvcStreamItemKindSpec<TItem>>
  >(() => this.itemSpec().kinds?.[this.kind()])

  protected readonly summaryContent = computed(
    () => this.kindSpec()?.summary ?? this.itemSpec().summary
  )
  protected readonly extraContent = computed(() => this.itemSpec().extra)
  protected readonly footerContent = computed(() => this.itemSpec().footer)

  /** whether THIS item expands */
  protected readonly expandable = computed(() => {
    const expandable = this.kindSpec()?.expandable
    return typeof expandable === 'function'
      ? expandable(this.item())
      : expandable === true
  })

  /**
   * Whether the stream renders a toggle rail at all — true when any kind is
   * expandable, so unexpandable items keep a placeholder and summaries stay
   * aligned down the list.
   */
  protected readonly hasToggleRail = computed(() =>
    Object.values(this.itemSpec().kinds ?? {}).some((kind) => kind.expandable)
  )

  protected readonly expanded = computed(() =>
    this.state.expandedIds().has(this.id())
  )

  protected readonly showSelectBox = computed(
    () => this.itemSpec().selectable !== undefined
  )
  protected readonly selectableItem = computed(
    () => this.itemSpec().selectable?.(this.item()) ?? false
  )
  protected readonly selectTooltip = computed(() =>
    this.itemSpec().selectTooltip?.(this.item())
  )
  protected readonly isSelected = computed(() =>
    this.state.selectedIds().has(this.id())
  )

  /**
   * The detail component once its lazy import has resolved. Per view: a
   * recycled view re-imports on next expansion, which the module loader
   * serves from its own cache.
   */
  private readonly loadedDetail =
    signal<Maybe<PolymorpheusComponent<object>>>(undefined)
  protected readonly detailContent = this.loadedDetail.asReadonly()
  protected readonly detailError = signal(false)

  /**
   * The context every outlet of this shell shares. One object per view,
   * referentially stable; the getters read the shell's own signals so
   * content holding the object always sees current values.
   */
  protected readonly context: CvcStreamItemContext<TItem> = this.buildContext()

  constructor() {
    // resolve the detail component the first time this item expands
    effect(() => {
      if (!this.expanded() || this.detailContent() || this.detailError()) {
        return
      }
      untracked(() => {
        const detail = this.kindSpec()?.detail
        if (detail) this.loadDetail(detail.load)
      })
    })
  }

  protected toggle(): void {
    if (!this.expandable()) return
    this.state.toggle(this.id())
  }

  protected setSelected(on: boolean): void {
    this.state.setSelected(this.id(), on)
  }

  /** clears the load failure; the load effect then tries again */
  protected retryDetail(): void {
    this.detailError.set(false)
  }

  /**
   * Height-affecting moments the scroll engine re-measures on: the
   * expand/collapse animation settling (skipping the initial state
   * application, which changes nothing), and lazily-loaded detail content
   * replacing its placeholder.
   */
  protected onDetailsDone(event: { fromState: string | boolean }): void {
    if (event.fromState === 'void') return
    this.state.heightSettled()
  }

  private loadDetail(load: () => Promise<Type<unknown>>): void {
    load()
      .then((component) => {
        this.loadedDetail.set(
          new PolymorpheusComponent(component as Type<object>)
        )
        afterNextRender(() => this.state.heightSettled(), {
          injector: this.injector,
        })
      })
      .catch(() => this.detailError.set(true))
  }

  private buildContext(): CvcStreamItemContext<TItem> {
    // the getters below run with the context object as `this`, so the
    // shell is captured by name
    const shell = this
    return {
      get $implicit(): TItem {
        return shell.item()
      },
      get item(): TItem {
        return shell.item()
      },
      get isScrolling(): boolean {
        return shell.scroll.isScrolling()
      },
      get expanded(): boolean {
        return shell.expanded()
      },
      get selected(): boolean {
        return shell.isSelected()
      },
      toggle: () => shell.toggle(),
      setSelected: (on: boolean) => shell.setSelected(on),
    }
  }
}
