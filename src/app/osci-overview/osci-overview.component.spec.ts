import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsciOverviewComponent } from './osci-overview.component';

describe('OsciOverviewComponent', () => {
  let component: OsciOverviewComponent;
  let fixture: ComponentFixture<OsciOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OsciOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OsciOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
