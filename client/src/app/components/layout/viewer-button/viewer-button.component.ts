import { Component } from '@angular/core'
import { Observable } from 'rxjs'
import { Viewer, ViewerService } from '@app/core/services/viewer/viewer.service'
import { Maybe, ViewerNotificationCountGQL } from '@app/generated/civic.apollo'
import { startWith, map } from 'rxjs/operators'
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal'
import { environment } from 'environments/environment'

@Component({
  selector: 'cvc-viewer-button',
  templateUrl: './viewer-button.component.html',
  styleUrls: ['./viewer-button.component.less'],
})
export class CvcViewerButtonComponent {
  viewer$: Observable<Viewer>
  unreadCount$: Observable<number>

  coiUpdateModalVisible: boolean = false
  addVariantModalVisible: boolean = false

  constructor(
    private queryService: ViewerService,
    private unreadCountGql: ViewerNotificationCountGQL
  ) {
    this.viewer$ = this.queryService.viewer$
    if (environment.production) {
      this.unreadCount$ = this.unreadCountGql
        .watch(undefined, { pollInterval: 5000 })
        .valueChanges.pipe(
          map(({ data }) => data.notifications.unreadCount),
          startWith(0)
        )
    } else {
      this.unreadCount$ = this.unreadCountGql
        .watch(undefined)
        .valueChanges.pipe(
          map(({ data }) => data.notifications.unreadCount),
          startWith(0)
        )
    }
  }

  signOut(): void {
    this.queryService.signOut()
  }

  coiUpdated() {
    this.coiUpdateModalVisible = false
    this.queryService.refetch()
  }

  handleCoiModalCancel() {
    this.coiUpdateModalVisible = false
  }
}
