import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpectroComponent } from './spectro.component';

describe('SpectroComponent', () => {
  let component: SpectroComponent;
  let fixture: ComponentFixture<SpectroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpectroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpectroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
