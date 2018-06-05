import { TestBed, inject } from '@angular/core/testing';

import { DrawHelperService } from './draw-helper.service';

describe('DrawHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DrawHelperService]
    });
  });

  it('should be created', inject([DrawHelperService], (service: DrawHelperService) => {
    expect(service).toBeTruthy();
  }));
});
