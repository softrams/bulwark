import { TestBed } from '@angular/core/testing';

import { GlobalManagerService } from './global-manager.service';

describe('GlobalManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlobalManagerService = TestBed.get(GlobalManagerService);
    expect(service).toBeTruthy();
  });
});
