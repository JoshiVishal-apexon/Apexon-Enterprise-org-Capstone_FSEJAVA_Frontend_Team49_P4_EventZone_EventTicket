import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MyBookingsComponent } from './my-bookings';
import { BookingService } from '../../../core/services/booking.service';
import { EventService } from '../../../core/services/event.service';
import { ToastService } from '../../../shared/services/toast.service';

describe('MyBookingsComponent', () => {
  let fixture: ComponentFixture<MyBookingsComponent>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let eventService: jasmine.SpyObj<EventService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    bookingService = jasmine.createSpyObj('BookingService', ['mine', 'cancel']);
    eventService = jasmine.createSpyObj('EventService', ['getById']);
    toastService = jasmine.createSpyObj('ToastService', ['success']);

    bookingService.mine.and.returnValue(
      of([
        {
          id: 1,
          bookingRef: 'BK-100',
          eventId: 'evt-1',
          eventTitle: 'Angular Summit',
          ticketCategoryName: 'General',
          quantity: 2,
          status: 'CONFIRMED',
          createdAt: '2026-09-20T18:00:00Z'
        }
      ])
    );

    eventService.getById.and.returnValue(
      of({
        id: 'evt-1',
        title: 'Angular Summit',
        description: 'A great Angular event',
        categoryName: 'Tech',
        eventDate: '2026-09-20T18:00:00Z',
        venue: 'Bengaluru',
        coverImageUrl: 'https://test.com/cover.png',
        active: true,
        ticketCategories: []
      })
    );

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

  it('should create the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load bookings for the current user', () => {
    expect(bookingService.mine).toHaveBeenCalled();
    expect(fixture.componentInstance.bookings().length).toBe(1);
  });

  it('should cancel a booking when confirmed', () => {
    const component = fixture.componentInstance;
    const booking = component.bookings()[0];
    spyOn(window, 'confirm').and.returnValue(true);
    bookingService.cancel.and.returnValue(
      of({
        ...booking,
        status: 'CANCELLED'
      })
    );

    component.cancel(booking);

    expect(bookingService.cancel).toHaveBeenCalledWith(1);
    expect(component.userCancelledBookingIds().has(1)).toBeTrue();
  });
});
