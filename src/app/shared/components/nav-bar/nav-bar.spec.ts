import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { NavBarComponent } from './nav-bar';
import { AuthService } from '../../../core/services/auth.service';

describe('NavBarComponent', () => {
  let fixture: ComponentFixture<NavBarComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['logout'], {
      currentUser: signal({
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN'
      })
    });
    authService.logout.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [NavBarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavBarComponent);
    fixture.detectChanges();
  });

  it('should create the navbar component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should toggle the profile menu open state', () => {
    expect(fixture.componentInstance.profileOpen).toBeFalse();

    fixture.componentInstance.toggleProfile();

    expect(fixture.componentInstance.profileOpen).toBeTrue();
  });

  it('should log the user out and navigate home', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture.componentInstance.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
