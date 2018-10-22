import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GhostLevelComponent } from './ghost-level.component';

describe('GhostLevelComponent', () => {
  let component: GhostLevelComponent;
  let fixture: ComponentFixture<GhostLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GhostLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GhostLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
