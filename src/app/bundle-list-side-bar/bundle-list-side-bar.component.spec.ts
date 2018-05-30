import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BundleListSideBarComponent } from './bundle-list-side-bar.component';

describe('BundleListSideBarComponent', () => {
  let component: BundleListSideBarComponent;
  let fixture: ComponentFixture<BundleListSideBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BundleListSideBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BundleListSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
