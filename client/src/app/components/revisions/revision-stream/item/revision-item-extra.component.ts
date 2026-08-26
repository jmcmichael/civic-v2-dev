import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { CvcOrganizationTagModule } from '@app/components/organizations/organization-tag/organization-tag.module'
import { CvcStatusTagModule } from '@app/components/shared/status-tag/status-tag.module'
import { CvcUserTagModule } from '@app/components/users/user-tag/user-tag.module'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcStreamItemContext } from '@app/streams/entity-stream.types'
import { injectContext } from '@taiga-ui/polymorpheus'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { RevisionStreamState } from '../revision-stream-state'
import { RevisionStreamNode } from '../revision-stream.types'

/**
 * The header's trailing cluster: who submitted (and for which
 * organization), when, the revision's status, and the Show Group link —
 * which reaches the facade's group filter through `RevisionStreamState`.
 */
@Component({
  selector: 'cvc-revision-item-extra',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzButtonModule,
    NzDividerModule,
    NzSpaceModule,
    NzTypographyModule,
    CvcOrganizationTagModule,
    CvcStatusTagModule,
    CvcUserTagModule,
    CvcPipesModule,
  ],
  template: `
    <nz-space
      nzSize="small"
      (click)="$event.stopPropagation()">
      <span *nzSpaceItem>
        @if (revision.creationActivity?.user; as user) {
          <span
            nz-typography
            nzType="secondary">
            By&nbsp;
          </span>
          <cvc-user-tag [user]="user"></cvc-user-tag>
          @if (revision.creationActivity?.organization; as org) {
            <span
              nz-typography
              nzType="secondary">
              for&nbsp;
            </span>
            <cvc-organization-tag [org]="org"></cvc-organization-tag>
          }
        } @else {
          <span
            nz-typography
            nzType="secondary"
            >Submitted</span
          >
        }
        <span
          nz-typography
          nzType="secondary"
          >{{ revision.createdAt | timeAgo }}</span
        >
      </span>
      <cvc-status-tag
        [status]="revision.status"
        *nzSpaceItem></cvc-status-tag>
      <nz-divider
        nzType="vertical"
        *nzSpaceItem></nz-divider>
      <a
        nz-button
        nzType="link"
        data-testid="revision-show-group"
        (click)="state.selectGroup(revision.revisionSetId)"
        *nzSpaceItem
        >Show Group</a
      >
    </nz-space>
  `,
})
export class CvcRevisionItemExtra {
  protected readonly context =
    injectContext<CvcStreamItemContext<RevisionStreamNode>>()
  protected readonly state = inject(RevisionStreamState)

  protected get revision(): RevisionStreamNode {
    return this.context.item
  }
}
