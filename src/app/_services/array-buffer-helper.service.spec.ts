import { TestBed, inject } from '@angular/core/testing';

import { ArrayBufferHelperService } from './array-buffer-helper.service';

describe('ArrayBufferHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ArrayBufferHelperService]
    });
  });

  it('should be created', inject([ArrayBufferHelperService], (service: ArrayBufferHelperService) => {
    expect(service).toBeTruthy();
  }));
});
