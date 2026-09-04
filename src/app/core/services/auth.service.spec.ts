import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should login and persist the session', () => {
    service.login({ email: 'jane@example.com', password: 'secret123' }).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    req.flush({
      token: 'token-123',
      name: 'Jane Doe',
      role: 'ATTENDEE',
      email: 'jane@example.com'
    });

    expect(service.isLoggedIn()).toBeTrue();
    expect(service.getToken()).toBe('token-123');
    expect(service.hasRole('ATTENDEE')).toBeTrue();
    expect(service.currentUser()?.name).toBe('Jane Doe');
    expect(sessionStorage.getItem('eventzone.auth')).toContain('token-123');
  });

  it('should register without changing the session', () => {
    service.register({ name: 'Jane Doe', email: 'jane@example.com', password: 'secret123' }).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
    req.flush(null);

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBeNull();
  });

  it('should log out and clear the stored session', () => {
    service.login({ email: 'jane@example.com', password: 'secret123' }).subscribe();
    httpMock.expectOne('http://localhost:8080/api/auth/login').flush({
      token: 'token-123',
      name: 'Jane Doe',
      role: 'ATTENDEE',
      email: 'jane@example.com'
    });

    service.logout().subscribe();

    const logoutReq = httpMock.expectOne('http://localhost:8080/api/auth/logout');
    logoutReq.flush(null);

    expect(service.isLoggedIn()).toBeFalse();
    expect(sessionStorage.getItem('eventzone.auth')).toBeNull();
  });

  it('should clear session data when manually requested', () => {
    service.login({ email: 'admin@example.com', password: 'secret123' }).subscribe();
    httpMock.expectOne('http://localhost:8080/api/auth/login').flush({
      token: 'admin-token',
      name: 'Admin',
      role: 'ADMIN',
      email: 'admin@example.com'
    });

    service.clearSession();

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.hasRole('ADMIN')).toBeFalse();
    expect(sessionStorage.getItem('eventzone.auth')).toBeNull();
  });

  it('should restore a valid session from storage on startup', () => {
    sessionStorage.setItem(
      'eventzone.auth',
      JSON.stringify({
        token: 'stored-token',
        user: { email: 'stored@example.com', name: 'Stored User', role: 'ORGANISER' }
      })
    );

    const fresh = new AuthService(TestBed.inject(HttpClient));

    expect(fresh.isLoggedIn()).toBeTrue();
    expect(fresh.getToken()).toBe('stored-token');
    expect(fresh.hasRole('ORGANISER')).toBeTrue();
  });

  it('should discard malformed session data', () => {
    sessionStorage.setItem('eventzone.auth', '{bad json');

    const fresh = new AuthService(TestBed.inject(HttpClient));

    expect(fresh.isLoggedIn()).toBeFalse();
    expect(sessionStorage.getItem('eventzone.auth')).toBeNull();
  });
});
