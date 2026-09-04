import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Factory returning a guard that requires the user to be logged in AND
 * hold one of the given roles. Not logged in -> /login. Logged in but
 * wrong role -> redirected home.
 *
 * Usage: `canActivate: [roleGuard('ORGANISER')]`
 */
export function roleGuard(...allowedRoles: UserRole[]): CanActivateFn {
  return (_route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      return router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } });
    }

    if (authService.hasRole(...allowedRoles)) {
      return true;
    }

    return router.createUrlTree(['/']);
  };
}
