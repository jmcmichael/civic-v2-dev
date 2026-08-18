import { Injectable, signal } from '@angular/core'

/**
 * Per-stream item state — which items are expanded and which are selected —
 * provided by the stream component and read by every item shell it renders.
 *
 * State is keyed by item id rather than held on item views, so it survives
 * the virtual scroller recycling views: an item scrolled out and back in
 * renders with the expansion and selection it had.
 *
 * The two callbacks are wired by the stream component: `onHeightSettled`
 * asks the scroll engine to re-measure after an in-place item height change,
 * and `onSelectionChange` propagates selection into the component's
 * `selectedIds` model.
 */
@Injectable()
export class CvcStreamState {
  private readonly expanded = signal<ReadonlySet<number>>(new Set())
  private readonly selected = signal<ReadonlySet<number>>(new Set())

  /** ids of the items whose detail regions are shown */
  readonly expandedIds = this.expanded.asReadonly()

  /** ids of the items in the current selection */
  readonly selectedIds = this.selected.asReadonly()

  /** wired by the stream component; see class docs */
  onHeightSettled: () => void = () => {}

  /** wired by the stream component; see class docs */
  onSelectionChange: (ids: ReadonlyArray<number>) => void = () => {}

  /** shows or hides one item's detail region */
  toggle(id: number): void {
    this.expanded.update((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /** adds or removes one item from the selection, reporting any change */
  setSelected(id: number, on: boolean): void {
    if (this.selected().has(id) === on) return
    const next = new Set(this.selected())
    if (on) next.add(id)
    else next.delete(id)
    this.selected.set(next)
    this.onSelectionChange([...next])
  }

  /**
   * Replaces the selection wholesale — the component's model-to-state
   * direction. Does not report through `onSelectionChange`: the change came
   * from the model, and echoing it back would loop.
   */
  setSelection(ids: ReadonlyArray<number>): void {
    const current = this.selected()
    if (current.size === ids.length && ids.every((id) => current.has(id))) {
      return
    }
    this.selected.set(new Set(ids))
  }

  /** reports that an item's height finished changing; see class docs */
  heightSettled(): void {
    this.onHeightSettled()
  }
}
