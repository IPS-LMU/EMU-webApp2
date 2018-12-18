import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewportInfoComponent } from './viewport-info.component';

describe('ViewportInfoComponent', () => {
  let component: ViewportInfoComponent;
  let fixture: ComponentFixture<ViewportInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewportInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewportInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
