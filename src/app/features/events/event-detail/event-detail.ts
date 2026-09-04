import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { EventDetail } from '../../../core/models/event.model';
import { Booking } from '../../../core/models/booking.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { ToastService } from '../../../shared/services/toast.service';

interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss'
})
export class EventDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly event = signal<EventDetail | null>(null);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly confirmedBooking = signal<Booking | null>(null);
  readonly countdown = signal<CountdownValue>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0
  });

  private countdownTimer?: ReturnType<typeof setInterval>;

  readonly isLoggedIn = this.authService.isLoggedIn;

  readonly form = this.fb.nonNullable.group({
    ticketCategoryId: [null as number | null, Validators.required],
    quantity: [1, [Validators.required, Validators.min(1), Validators.max(5)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.eventService.getById(id).subscribe({
      next: (event) => {
        this.event.set(event);
        this.startCountdown(event.eventDate);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  get ticketCategoryId() {
    return this.form.controls.ticketCategoryId;
  }

  get quantity() {
    return this.form.controls.quantity;
  }

  onSubmit(): void {
    if (!this.isLoggedIn() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { ticketCategoryId, quantity } = this.form.getRawValue();
    if (ticketCategoryId === null) {
      return;
    }

    this.submitting.set(true);
    this.confirmedBooking.set(null);
    this.bookingService.create({ ticketCategoryId, quantity }).subscribe({
      next: (booking) => {
        this.confirmedBooking.set(booking);
        this.toast.success(`Booked! Reference: ${booking.bookingRef}`);
        this.submitting.set(false);
        this.form.reset({ ticketCategoryId: null, quantity: 1 });
        this.refreshEvent();
      },
      error: () => this.submitting.set(false)
    });
  }

  private refreshEvent(): void {
    const current = this.event();
    if (!current) {
      return;
    }
    this.eventService.getById(current.id).subscribe({
      next: (event) => {
        this.event.set(event);
        this.startCountdown(event.eventDate);
      }
    });
  }

  private startCountdown(eventDate: string): void {
    this.stopCountdown();
    this.updateCountdown(eventDate);

    if (this.countdown().totalSeconds > 0) {
      this.countdownTimer = setInterval(() => this.updateCountdown(eventDate), 1000);
    }
  }

  private stopCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
  }

  private updateCountdown(eventDate: string): void {
    const remainingSeconds = Math.max(
      0,
      Math.floor((new Date(eventDate).getTime() - Date.now()) / 1000)
    );

    this.countdown.set({
      days: Math.floor(remainingSeconds / 86400),
      hours: Math.floor((remainingSeconds % 86400) / 3600),
      minutes: Math.floor((remainingSeconds % 3600) / 60),
      seconds: remainingSeconds % 60,
      totalSeconds: remainingSeconds
    });

    if (remainingSeconds === 0) {
      this.stopCountdown();
    }
  }
}
