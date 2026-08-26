import { Injectable } from '@angular/core'

/**
 * The facade DI channel for revision item renderers: item-level content
 * reaches the facade through this service, because inputs cannot cross
 * the stream core's polymorpheus outlets.
 *
 * Provided by `CvcRevisionStream`, which wires the callback to its
 * group-filter handler.
 */
@Injectable()
export class RevisionStreamState {
  /** wired by the facade; receives the clicked item's revisionSetId */
  onSelectGroup: (revisionSetId: number) => void = () => {}

  /** the header extra's Show Group action */
  selectGroup(revisionSetId: number): void {
    this.onSelectGroup(revisionSetId)
  }
}
