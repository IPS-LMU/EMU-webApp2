import { TestBed, inject } from '@angular/core/testing';

import { BinaryDataManipHelperService } from './binary-data-manip-helper.service';

describe('BinaryDataManipHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BinaryDataManipHelperService]
    });
  });

  it('should be created', inject([BinaryDataManipHelperService], (service: BinaryDataManipHelperService) => {
    expect(service).toBeTruthy();
  }));
});
