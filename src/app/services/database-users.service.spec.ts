import { TestBed } from '@angular/core/testing';

import { DatabaseUsersService } from './database-users.service';

describe('DatabaseUsersService', () => {
  let service: DatabaseUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatabaseUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
