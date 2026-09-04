import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { EventDetailComponent } from './event-detail';
import { EventService } from '../../../core/services/event.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

describe('EventDetailComponent', () => {
  let fixture: ComponentFixture<EventDetailComponent>;
  let eventService: jasmine.SpyObj<EventService>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    eventService = jasmine.createSpyObj('EventService', ['getById']);
    bookingService = jasmine.createSpyObj('BookingService', ['create']);
    authService = jasmine.createSpyObj('AuthService', ['isLoggedIn'], {
      isLoggedIn: signal(true)
    });
    toastService = jasmine.createSpyObj('ToastService', ['success']);

    eventService.getById.and.returnValue(
      of({
        id: 'evt-1',
        title: 'Angular Summit',
        description: 'A great Angular event',
        categoryName: 'Tech',
        eventDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        venue: 'Bengaluru',
        coverImageUrl: 'https://test.com/image.png',
        active: true,
        ticketCategories: [
          { id: 10, name: 'General', price: 499, totalSeats: 100, availableSeats: 20 }
        ]
      })
    );

    bookingService.create.and.returnValue(
      of({
        id: 1,
        bookingRef: 'BK-123',
        eventId: 'evt-1',
        eventTitle: 'Angular Summit',
        ticketCategoryName: 'General',
        quantity: 2,
        status: 'CONFIRMED',
        createdAt: '2026-09-20T18:00:00Z'
      })
    );

    await TestBed.configureTestingModule({
      imports: [EventDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'evt-1'
              }
            }
          }
        },
        { provide: EventService, useValue: eventService },
        { provide: BookingService, useValue: bookingService },
        { provide: AuthService, useValue: authService },
        { provide: ToastService, useValue: toastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventDetailComponent);
    fixture.detectChanges();
  });

  it('should create the event detail component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load the event details on init', () => {
    expect(eventService.getById).toHaveBeenCalledWith('evt-1');
    expect(fixture.componentInstance.event()?.id).toBe('evt-1');
  });

  it('should book tickets when the form is valid', () => {
    const component = fixture.componentInstance;
    component.form.setValue({ ticketCategoryId: 10, quantity: 2 });

    component.onSubmit();

    expect(bookingService.create).toHaveBeenCalledWith({ ticketCategoryId: 10, quantity: 2 });
    expect(toastService.success).toHaveBeenCalledWith('Booked! Reference: BK-123');
    expect(component.confirmedBooking()?.bookingRef).toBe('BK-123');
  });
});
