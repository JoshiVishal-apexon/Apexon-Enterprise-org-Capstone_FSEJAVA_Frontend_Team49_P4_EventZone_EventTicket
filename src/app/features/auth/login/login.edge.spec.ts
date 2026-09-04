import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { LoginComponent } from './login';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

describe('LoginComponent edge cases', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login']);
    toastService = jasmine.createSpyObj('ToastService', ['success']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ToastService, useValue: toastService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: () => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });

  it('should not submit invalid login form', () => {
    fixture.componentInstance.form.setValue({ email: '', password: '12' });

    fixture.componentInstance.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.touched).toBeTrue();
  });

  it('should redirect to home when no redirectTo param is present', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    authService.login.and.returnValue(
      of({ token: 'abc', name: 'Jane', role: 'ATTENDEE', email: 'jane@example.com' })
    );

    fixture.componentInstance.form.setValue({ email: 'jane@example.com', password: 'secret123' });
    fixture.componentInstance.onSubmit();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });
});
