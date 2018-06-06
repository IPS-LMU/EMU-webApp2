import { TestBed, inject } from '@angular/core/testing';

import { MathHelperService } from './math-helper.service';

describe('MathHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MathHelperService]
    });
  });

  it('should be created', inject([MathHelperService], (service: MathHelperService) => {
    expect(service).toBeTruthy();
  }));
});
