import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsffTrackComponent } from './ssff-track.component';

describe('SsffTrackComponent', () => {
  let component: SsffTrackComponent;
  let fixture: ComponentFixture<SsffTrackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsffTrackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsffTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
