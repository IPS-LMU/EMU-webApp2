import { TestBed, inject } from '@angular/core/testing';

import { ViewStateService } from './view-state.service';

describe('ViewStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ViewStateService]
    });
  });

  it('should be created', inject([ViewStateService], (service: ViewStateService) => {
    expect(service).toBeTruthy();
  }));
});
