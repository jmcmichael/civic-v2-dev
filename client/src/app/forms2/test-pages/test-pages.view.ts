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
        routeName: 'evidence-submit-test',
        iconName: '',
        tabLabel: 'Evidence Submit',
      },
      {
        routeName: 'evidence-revise-test',
        iconName: '',
        tabLabel: 'Evidence Revise',
      },
      {
        routeName: 'assertion-submit-test',
        iconName: '',
        tabLabel: 'Assertion Submit',
      },
      {
        routeName: 'assertion-revise-test',
        iconName: '',
        tabLabel: 'Assertion Revise',
      },
      {
        routeName: 'nonstate-form',
        iconName: '',
        tabLabel: 'Nonstate Form',
      },
      {
        routeName: 'inline-form',
        iconName: '',
        tabLabel: 'Inline Form',
      },
      {
        routeName: 'horizontal-form',
        iconName: '',
        tabLabel: 'Horizontal Form',
      },
      {
        routeName: 'icons-test',
        iconName: '',
        tabLabel: 'Icons',
      },
    ]
  }

  ngOnInit(): void {}
}
