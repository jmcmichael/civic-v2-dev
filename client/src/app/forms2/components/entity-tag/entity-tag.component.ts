import { Component, Input, OnInit } from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo'
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
  private typename!: string
  private id!: number
  entity!: LinkableEntity

  @Input()
  set cvcCacheId(cacheId: string) {
    if (!cacheId) return
    this._cacheId = cacheId
    this.setLinkableEntity(cacheId)
  }
  get cvcCacheId(): string {
    return this._cacheId
  }
  constructor(private apollo: Apollo) {}

  private setLinkableEntity(cacheId: string) {
    const [typename, id] = cacheId.split(':')
    this.typename = typename
    this.id = +id
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
