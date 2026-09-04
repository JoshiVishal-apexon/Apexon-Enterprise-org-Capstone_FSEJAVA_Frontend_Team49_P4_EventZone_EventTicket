import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';
import { ApiError } from '../models/api-error.model';

/**
 * Extracts the `message` field from the API's standard error shape and
 * surfaces it via the in-app toast service, then re-throws so callers can
 * still react (e.g. to keep a form open) if they need to.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const message = extractMessage(err);
        toast.error(message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
      return throwError(() => err);
    })
  );
};

function extractMessage(err: HttpErrorResponse): string {
  const body = err.error as Partial<ApiError> | string | null | undefined;

  if (body && typeof body === 'object' && typeof body.message === 'string') {
    return body.message;
  }
  if (err.status === 0) {
    return 'Cannot reach the server. Please check your connection and try again.';
  }
  if (err.status === 401) {
    return 'Your session has expired or you are not logged in.';
  }
  if (err.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  return `Request failed (${err.status}). Please try again.`;
}
