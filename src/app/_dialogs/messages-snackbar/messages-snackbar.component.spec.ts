import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesSnackbarComponent } from './messages-snackbar.component';

describe('MessagesSnackbarComponent', () => {
  let component: MessagesSnackbarComponent;
  let fixture: ComponentFixture<MessagesSnackbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessagesSnackbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
