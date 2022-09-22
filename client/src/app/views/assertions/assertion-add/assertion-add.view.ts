import { Component } from '@angular/core'
import { ViewerService } from '@app/core/services/viewer/viewer.service'
import { Observable, map } from 'rxjs'

@Component({
  selector: 'cvc-assertion-add',
  templateUrl: './assertion-add.view.html',
  styleUrls: ['./assertion-add.view.less'],
})
export class AssertionAddView {
  isSignedIn$: Observable<boolean>

  constructor(private viewerService: ViewerService) {
    this.isSignedIn$ = this.viewerService.viewer$.pipe(map((v) => v.signedIn))
  }
}
