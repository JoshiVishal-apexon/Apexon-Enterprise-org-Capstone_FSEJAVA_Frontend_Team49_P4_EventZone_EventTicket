import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EventDetailComponent } from './event-detail';
import { EventService } from '../../../core/services/event.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

describe('EventDetailComponent edge cases', () => {
  let fixture: ComponentFixture<EventDetailComponent>;
  let eventService: jasmine.SpyObj<EventService>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    eventService = jasmine.createSpyObj('EventService', ['getById']);
    bookingService = jasmine.createSpyObj('BookingService', ['create']);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn']);
    authService.isLoggedIn.and.returnValue(true);
    toastService = jasmine.createSpyObj('ToastService', ['success']);

    eventService.getById.and.returnValue(
      of({
        id: 'evt-1',
        title: 'Angular Summit',
        description: 'A great Angular event',
        categoryName: 'Tech',
        eventDate: new Date(Date.now() + 1000).toISOString(),
        venue: 'Bengaluru',
        coverImageUrl: '',
        active: true,
        ticketCategories: [{ id: 10, name: 'General', price: 499, totalSeats: 2, availableSeats: 0 }]
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

  it('should not submit if user is not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);
    fixture.componentInstance.form.setValue({ ticketCategoryId: 10, quantity: 1 });

    fixture.componentInstance.onSubmit();

    expect(bookingService.create).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.touched).toBeTrue();
  });

  it('should not load event details when route id is missing', () => {
    const route = TestBed.inject(ActivatedRoute) as any;
    const callCountBefore = eventService.getById.calls.count();
    route.snapshot.paramMap.get = () => null;

    fixture.componentInstance.ngOnInit();

    expect(eventService.getById.calls.count()).toBe(callCountBefore);
  });

  it('should ignore submission when no ticket category is selected', () => {
    authService.isLoggedIn.and.returnValue(true);
    fixture.componentInstance.form.setValue({ ticketCategoryId: null, quantity: 1 });

    fixture.componentInstance.onSubmit();

    expect(bookingService.create).not.toHaveBeenCalled();
  });
});
