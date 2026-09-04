import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('roleGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'hasRole']);
    authService.isLoggedIn.and.returnValue(false);
    authService.hasRole.and.returnValue(false);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        {
          provide: Router,
          useValue: {
            createUrlTree: jasmine.createSpy('createUrlTree').and.callFake((commands, extras) => ({
              commands,
              extras
            } as unknown as UrlTree))
          }
        }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('should redirect to login when user is not authenticated', () => {
    const guard = roleGuard('ADMIN');

    const result = TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, { url: '/admin' } as RouterStateSnapshot)
    ) as any;

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { redirectTo: '/admin' } });
    expect(result.commands).toEqual(['/login']);
    expect(result.extras.queryParams).toEqual({ redirectTo: '/admin' });
  });

  it('should allow access for a user with the required role', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.hasRole.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard('ADMIN')({} as ActivatedRouteSnapshot, { url: '/admin' } as RouterStateSnapshot)
    );

    expect(result).toBeTrue();
  });

  it('should redirect home when user is logged in but lacks the required role', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.hasRole.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard('ADMIN')({} as ActivatedRouteSnapshot, { url: '/admin' } as RouterStateSnapshot)
    ) as any;

    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result.commands).toEqual(['/']);
  });
});
