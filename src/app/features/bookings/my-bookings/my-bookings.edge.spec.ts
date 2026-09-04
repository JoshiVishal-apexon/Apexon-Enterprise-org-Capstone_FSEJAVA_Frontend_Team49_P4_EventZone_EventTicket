import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MyBookingsComponent } from './my-bookings';
import { BookingService } from '../../../core/services/booking.service';
import { EventService } from '../../../core/services/event.service';
import { ToastService } from '../../../shared/services/toast.service';

describe('MyBookingsComponent edge cases', () => {
  let fixture: ComponentFixture<MyBookingsComponent>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let eventService: jasmine.SpyObj<EventService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    bookingService = jasmine.createSpyObj('BookingService', ['mine', 'cancel']);
    eventService = jasmine.createSpyObj('EventService', ['getById']);
    toastService = jasmine.createSpyObj('ToastService', ['success']);

    bookingService.mine.and.returnValue(of([]));
    eventService.getById.and.returnValue(of({
      id: 'evt-1',
      title: 'Angular Summit',
      description: 'desc',
      categoryName: 'Tech',
      eventDate: '2026-09-20T18:00:00Z',
      venue: 'Bengaluru',
      coverImageUrl: '',
      active: false,
      ticketCategories: []
    }));

    await TestBed.configureTestingModule({
      imports: [MyBookingsComponent],
      providers: [
        { provide: BookingService, useValue: bookingService },
        { provide: EventService, useValue: eventService },
        { provide: ToastService, useValue: toastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyBookingsComponent);
    fixture.detectChanges();
  });

  it('should show empty state when there are no bookings', () => {
    expect(fixture.componentInstance.bookings().length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('You have no bookings yet.');
  });

  it('should not cancel booking if user cancels confirmation', () => {
    const booking = {
      id: 7,
      bookingRef: 'BK-7',
      eventId: 'evt-1',
      eventTitle: 'Angular Summit',
      ticketCategoryName: 'General',
      quantity: 1,
      status: 'CONFIRMED',
      createdAt: '2026-09-20T18:00:00Z'
    };

    spyOn(window, 'confirm').and.returnValue(false);
    fixture.componentInstance.bookings.set([booking]);

    fixture.componentInstance.cancel(booking);

    expect(bookingService.cancel).not.toHaveBeenCalled();
  });

  it('should flag event cancelled status correctly', () => {
    const booking = {
      id: 9,
      bookingRef: 'BK-9',
      eventId: 'evt-1',
      eventTitle: 'Angular Summit',
      ticketCategoryName: 'General',
      quantity: 1,
      status: 'CONFIRMED',
      createdAt: '2026-09-20T18:00:00Z'
    };

    fixture.componentInstance.cancelledEventIds.set(new Set(['evt-1']));
    expect(fixture.componentInstance.displayStatus(booking)).toBe('CANCELLED');
    expect(fixture.componentInstance.isEventCancelled(booking)).toBeTrue();
  });

  it('should compute cancellable and user-cancelled states', () => {
    const booking = {
      id: 11,
      bookingRef: 'BK-11',
      eventId: 'evt-2',
      eventTitle: 'React Summit',
      ticketCategoryName: 'VIP',
      quantity: 1,
      status: 'CONFIRMED',
      createdAt: '2026-09-20T18:00:00Z'
    };

    expect(fixture.componentInstance.isCancellable(booking)).toBeTrue();

    fixture.componentInstance.cancelledEventIds.set(new Set(['evt-2']));
    expect(fixture.componentInstance.isCancellable(booking)).toBeFalse();

    fixture.componentInstance.userCancelledBookingIds.set(new Set([11]));
    expect(fixture.componentInstance.isUserCancelled(booking)).toBeTrue();
  });
});
