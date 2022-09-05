import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneSelectType } from './gene-select.type';

describe('GeneSelectType', () => {
  let component: GeneSelectType;
  let fixture: ComponentFixture<GeneSelectType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneSelectType ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneSelectType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
