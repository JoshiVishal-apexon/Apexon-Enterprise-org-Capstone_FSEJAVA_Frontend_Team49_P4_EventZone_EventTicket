import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { errorInterceptor } from './error.interceptor';
import { ToastService } from '../../shared/services/toast.service';

describe('errorInterceptor', () => {
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toast = jasmine.createSpyObj('ToastService', ['error']);
    TestBed.configureTestingModule({
      providers: [{ provide: ToastService, useValue: toast }]
    });
  });

  it('should show a backend message when the API returns a structured error', () => {
    const req = new HttpRequest('GET', '/api/test');
    const err = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: { message: 'Invalid token' }
    });

    const result = TestBed.runInInjectionContext(() =>
      errorInterceptor(req, () => throwError(() => err))
    );

    result.subscribe({ error: () => undefined });

    expect(toast.error).toHaveBeenCalledWith('Invalid token');
  });

  it('should show a generic message for non-Http errors', () => {
    const req = new HttpRequest('GET', '/api/test');

    const result = TestBed.runInInjectionContext(() =>
      errorInterceptor(req, () => throwError(() => new Error('boom')))
    );

    result.subscribe({ error: () => undefined });

    expect(toast.error).toHaveBeenCalledWith('Something went wrong. Please try again.');
  });

  it('should handle a disconnected-server error', () => {
    const req = new HttpRequest('GET', '/api/down');
    const err = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });

    const result = TestBed.runInInjectionContext(() =>
      errorInterceptor(req, () => throwError(() => err))
    );

    result.subscribe({ error: () => undefined });

    expect(toast.error).toHaveBeenCalledWith(
      'Cannot reach the server. Please check your connection and try again.'
    );
  });

  it('should show a permission error message for forbidden requests', () => {
    const req = new HttpRequest('GET', '/api/forbidden');
    const err = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });

    const result = TestBed.runInInjectionContext(() =>
      errorInterceptor(req, () => throwError(() => err))
    );

    result.subscribe({ error: () => undefined });

    expect(toast.error).toHaveBeenCalledWith('You do not have permission to perform this action.');
  });
});
