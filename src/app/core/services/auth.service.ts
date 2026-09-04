import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserRole
} from '../models/user.model';

const STORAGE_KEY = 'eventzone.auth';

interface StoredAuth {
  token: string;
  user: AuthUser;
}

/**
 * Holds the current authenticated user (in memory, backed by a signal) and
 * persists the session to sessionStorage so a page refresh doesn't log the
 * user out, while still clearing on tab close (unlike localStorage).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<AuthUser | null>(null);
  private token: string | null = null;

  /** Read-only signal for templates/guards to react to auth state changes. */
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  constructor(private readonly http: HttpClient) {
    this.restoreSession();
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, request)
      .pipe(
        tap((response) => {
          const user: AuthUser = {
            email: response.email,
            name: response.name,
            role: response.role
          };
          this.setSession(response.token, user);
        })
      );
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/register`, request);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/logout`, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  /** Discards the local session regardless of whether the API call succeeds. */
  clearSession(): void {
    this.token = null;
    this.currentUserSignal.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  getToken(): string | null {
    return this.token;
  }

  hasRole(...roles: UserRole[]): boolean {
    const user = this.currentUserSignal();
    return !!user && roles.includes(user.role);
  }

  private setSession(token: string, user: AuthUser): void {
    this.token = token;
    this.currentUserSignal.set(user);
    const stored: StoredAuth = { token, user };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }

  private restoreSession(): void {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const stored: StoredAuth = JSON.parse(raw);
      this.token = stored.token;
      this.currentUserSignal.set(stored.user);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
}
