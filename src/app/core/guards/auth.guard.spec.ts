import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn']);
    authService.isLoggedIn.and.returnValue(false);

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
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/my-bookings' } as RouterStateSnapshot)
    ) as any;

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { redirectTo: '/my-bookings' } });
    expect(result.commands).toEqual(['/login']);
    expect(result.extras.queryParams).toEqual({ redirectTo: '/my-bookings' });
  });

  it('should allow access when user is authenticated', () => {
    authService.isLoggedIn.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/my-bookings' } as RouterStateSnapshot)
    );

    expect(result).toBeTrue();
  });
});
