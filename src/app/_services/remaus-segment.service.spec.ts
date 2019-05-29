import { TestBed, inject } from '@angular/core/testing';

import { RemausSegmentService } from './remaus-segment.service';

describe('RemausSegmentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RemausSegmentService]
    });
  });

  it('should be created', inject([RemausSegmentService], (service: RemausSegmentService) => {
    expect(service).toBeTruthy();
  }));
});
