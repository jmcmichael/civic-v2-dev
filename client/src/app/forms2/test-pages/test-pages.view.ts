import { Component, OnInit } from '@angular/core'
import { RouteableTab } from '@app/components/shared/tab-navigation/tab-navigation.component'

@Component({
  selector: 'cvc-test-pages',
  templateUrl: './test-pages.view.html',
  styleUrls: ['./test-pages.view.less'],
})
export class TestPagesView implements OnInit {
  tabs: RouteableTab[]
  constructor() {
    this.tabs = [
      {
        routeName: 'nonstate-form',
        iconName: 'outline',
        tabLabel: 'Fields',
      },
    ]
  }

  ngOnInit(): void {}
}
