import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { soloEspecialistasGuard } from './solo-especialistas.guard';

describe('soloEspecialistasGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => soloEspecialistasGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
