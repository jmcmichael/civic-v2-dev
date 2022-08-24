import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Apollo, gql } from 'apollo-angular'
export interface LinkableEntity {
  id: number,
  name: string,
  link?: string
}
@Component({
  selector: 'cvc-entity-tag',
  templateUrl: './entity-tag.component.html',
  styleUrls: ['./entity-tag.component.less'],
})
export class CvcEntityTagComponent implements OnInit {
  _cacheId!: string
  @Input()
  set cvcCacheId(cacheId: string) {
    if (!cacheId) {
      console.error(`cvc-entity-tag requires valid cacheId Input string.`)
      return
    }
    this._cacheId = cacheId
    this.setLinkableEntity(cacheId)
  }
  get cvcCacheId(): string {
    return this._cacheId
  }
  @Input() cvcCloseable: boolean = false
  @Output() cvcOnClose: EventEmitter<MouseEvent>

  typename?: string
  id?: number
  entity?: LinkableEntity

  constructor(private apollo: Apollo) {
    this.cvcOnClose = new EventEmitter<MouseEvent>()
  }

  private setLinkableEntity(cacheId: string) {
    const [typename, id] = cacheId.split(':')
    this.typename = typename
    this.id = +id
    if(!this.typename || !this.id) {
      console.error(`entity-tag received an invalid cacheId: ${cacheId}. Cache IDs must be in the format 'TYPENAME:ID'.`)
      return
    }
    // get linkable entity
    const fragment = {
      id: `${typename}:${id}`,
      fragment: gql`
        fragment LinkableEntity on ${typename} {
          id
          name
          link
        }
      `,
    }
    const entity = this.apollo.client.readFragment(fragment) as LinkableEntity
    if (!entity) {
      console.error(`entity-tag could not find cached entity ${cacheId}`)
      return
    }
    this.entity = entity
  }

  ngOnInit(): void {}
}
