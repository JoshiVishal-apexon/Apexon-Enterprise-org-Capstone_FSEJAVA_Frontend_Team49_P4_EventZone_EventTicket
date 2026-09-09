import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, forkJoin, of } from 'rxjs';
import { BookingService } from '../../../core/services/booking.service';
import { EventService } from '../../../core/services/event.service';
import { Booking } from '../../../core/models/booking.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.scss'
})
export class MyBookingsComponent implements OnInit, OnDestroy {
  private readonly bookingService = inject(BookingService);
  private readonly eventService = inject(EventService);
  private readonly toast = inject(ToastService);
  private autoSlideTimer?: ReturnType<typeof setInterval>;

  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(false);
  readonly cancellingId = signal<number | null>(null);
  readonly cancelledEventIds = signal<Set<string>>(new Set());
  readonly userCancelledBookingIds = signal<Set<number>>(new Set());
  readonly currentSlide = signal(0);
  readonly heroSlides = [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1800&q=82',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1800&q=82',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbda3e?auto=format&fit=crop&w=1800&q=82',
    'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1800&q=82',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1800&q=82'
  ];

  ngOnInit(): void {
    this.load();
    this.autoSlideTimer = setInterval(() => this.nextSlide(), 5000);
  }

  ngOnDestroy(): void {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }
  }

  cancel(booking: Booking): void {
    const confirmed = window.confirm(
      `Cancel booking ${booking.bookingRef} for "${booking.eventTitle}"?`
    );
    if (!confirmed) {
      return;
    }

    this.cancellingId.set(booking.id);
    this.bookingService.cancel(booking.id).subscribe({
      next: (updated) => {
        this.bookings.update((list) => list.map((b) => (b.id === updated.id ? updated : b)));
        this.userCancelledBookingIds.update((ids) => new Set(ids).add(updated.id));
        this.toast.success(
          'Booking cancelled. You will get the refund amount in your original payment source within 3 to 5 business days.'
        );
        this.cancellingId.set(null);
      },
      error: () => this.cancellingId.set(null)
    });
  }

  isCancellable(booking: Booking): boolean {
    return booking.status !== 'CANCELLED' && !this.isEventCancelled(booking);
  }

  isEventCancelled(booking: Booking): boolean {
    return booking.status !== 'CANCELLED' && this.cancelledEventIds().has(booking.eventId);
  }

  displayStatus(booking: Booking): string {
    return this.isEventCancelled(booking) ? 'CANCELLED' : booking.status;
  }

  isUserCancelled(booking: Booking): boolean {
    return this.userCancelledBookingIds().has(booking.id);
  }

  nextSlide(): void {
    this.currentSlide.update((slide) => (slide + 1) % this.heroSlides.length);
  }

  selectSlide(slide: number): void {
    this.currentSlide.set(slide);
  }

  private load(): void {
    this.loading.set(true);
    this.bookingService.mine().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        if (bookings.length === 0) {
          this.loading.set(false);
          return;
        }

        forkJoin(
          bookings.map((booking) =>
            this.eventService.getById(booking.eventId).pipe(catchError(() => of(null)))
          )
        ).subscribe((events) => {
          this.cancelledEventIds.set(
            new Set(
              events
                .filter((event): event is NonNullable<typeof event> => event !== null && !event.active)
                .map((event) => event.id)
            )
          );
          this.loading.set(false);
        });
      },
      error: () => this.loading.set(false)
    });
  }
}
