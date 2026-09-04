import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { RegisterComponent } from './register';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['register']);
    toastService = jasmine.createSpyObj('ToastService', ['success']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ToastService, useValue: toastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
  });

  it('should create the register component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should submit a valid form and navigate to login', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    authService.register.and.returnValue(of(void 0));

    fixture.componentInstance.form.setValue({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123'
    });

    fixture.componentInstance.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123'
    });
    expect(toastService.success).toHaveBeenCalledWith('Account created. Please log in.');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
