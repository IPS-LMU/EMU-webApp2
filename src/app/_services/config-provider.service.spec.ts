import { TestBed, inject } from '@angular/core/testing';

import { ConfigProviderService } from './config-provider.service';

describe('ConfigProviderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfigProviderService]
    });
  });

  it('should be created', inject([ConfigProviderService], (service: ConfigProviderService) => {
    expect(service).toBeTruthy();
  }));
});
