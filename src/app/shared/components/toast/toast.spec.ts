import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast';
import { ToastService } from '../../services/toast.service';

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [{ provide: ToastService, useValue: { toasts: () => [], dismiss: jasmine.createSpy('dismiss') } }]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should dismiss a toast when requested', () => {
    fixture.componentInstance.dismiss(42);
    expect((toastService as any).dismiss).toHaveBeenCalledWith(42);
  });
});
