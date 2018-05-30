import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsciComponent } from './osci.component';

describe('OsciComponent', () => {
  let component: OsciComponent;
  let fixture: ComponentFixture<OsciComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OsciComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OsciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
