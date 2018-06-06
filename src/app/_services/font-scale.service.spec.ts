import { TestBed, inject } from '@angular/core/testing';

import { FontScaleService } from './font-scale.service';

describe('FontScaleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FontScaleService]
    });
  });

  it('should be created', inject([FontScaleService], (service: FontScaleService) => {
    expect(service).toBeTruthy();
  }));
});
