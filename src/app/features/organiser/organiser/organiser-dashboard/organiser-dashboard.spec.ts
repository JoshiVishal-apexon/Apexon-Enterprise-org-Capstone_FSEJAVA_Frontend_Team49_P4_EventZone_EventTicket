import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OrganiserDashboardComponent } from './organiser-dashboard';
import { OrganiserService } from '../../../../core/services/organiser.service';
import { EventService } from '../../../../core/services/event.service';
import { BookingService } from '../../../../core/services/booking.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ToastService } from '../../../../shared/services/toast.service';

describe('OrganiserDashboardComponent', () => {
  let fixture: ComponentFixture<OrganiserDashboardComponent>;
  let organiserService: jasmine.SpyObj<OrganiserService>;
  let eventService: jasmine.SpyObj<EventService>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    organiserService = jasmine.createSpyObj('OrganiserService', ['myEvents']);
    eventService = jasmine.createSpyObj('EventService', ['create', 'update', 'delete', 'addTicketCategory', 'updateTicketCategory', 'getById']);
    bookingService = jasmine.createSpyObj('BookingService', ['cancelForEvent']);
    categoryService = jasmine.createSpyObj('CategoryService', ['list']);
    toastService = jasmine.createSpyObj('ToastService', ['success', 'show']);

    organiserService.myEvents.and.returnValue(
      of([
        {
          id: 'evt-1',
          title: 'Angular Summit',
          categoryName: 'Tech',
          eventDate: '2026-09-20T18:00:00Z',
          venue: 'Bengaluru',
          active: true,
          ticketCategories: []
        }
      ])
    );
    categoryService.list.and.returnValue(
      of([
        { id: 1, name: 'Tech' },
        { id: 2, name: 'Music' }
      ])
    );
    eventService.create.and.returnValue(
      of({
        id: 'evt-2',
        title: 'New Event',
        description: 'Some event',
        categoryName: 'Tech',
        eventDate: '2026-09-20T18:00:00Z',
        venue: 'Delhi',
        coverImageUrl: 'http://example.com/image.jpg',
        active: true,
        ticketCategories: []
      })
    );
    eventService.addTicketCategory.and.returnValue(of({ id: 3, name: 'General', price: 299, totalSeats: 100, availableSeats: 100 }));

    await TestBed.configureTestingModule({
      imports: [OrganiserDashboardComponent],
      providers: [
        { provide: OrganiserService, useValue: organiserService },
        { provide: EventService, useValue: eventService },
        { provide: BookingService, useValue: bookingService },
        { provide: CategoryService, useValue: categoryService },
        { provide: ToastService, useValue: toastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganiserDashboardComponent);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load organiser events and categories on init', () => {
    expect(organiserService.myEvents).toHaveBeenCalled();
    expect(categoryService.list).toHaveBeenCalled();
    expect(fixture.componentInstance.events().length).toBe(1);
    expect(fixture.componentInstance.categories().length).toBe(2);
  });

  it('should open the add event form and add a ticket category row', () => {
    const component = fixture.componentInstance;
    component.openAddEventForm();
    component.addTicketCategoryRow();

    expect(component.showAddEventForm()).toBeTrue();
    expect(component.ticketCategoryRows.length).toBe(1);
  });

  it('should submit a new event with ticket categories and delete an existing event after confirmation', () => {
    const component = fixture.componentInstance;
    spyOn(window, 'confirm').and.returnValue(true);
    eventService.delete = jasmine.createSpy().and.returnValue(of(void 0));
    bookingService.cancelForEvent.and.returnValue(of(void 0));

    component.addTicketCategoryRow();
    component.ticketCategoryRows.at(0).setValue({
      id: null,
      name: 'General',
      price: 299,
      totalSeats: 100
    });
    component.eventForm.patchValue({
      title: 'New Event',
      description: 'Description',
      eventDate: '2026-10-10T18:00:00',
      venue: 'Delhi',
      coverImageUrl: 'https://example.com/cover.jpg',
      categoryId: 1
    });
    component.submitEventForm();

    expect(eventService.create).toHaveBeenCalled();
    expect(toastService.success).toHaveBeenCalledWith('Event created.');

    component.deleteEvent({
      id: 'evt-1',
      title: 'Angular Summit',
      categoryName: 'Tech',
      eventDate: '2026-09-20T18:00:00Z',
      venue: 'Bengaluru',
      active: true,
      ticketCategories: []
    });

    expect(bookingService.cancelForEvent).toHaveBeenCalledWith('evt-1');
    expect(eventService.delete).toHaveBeenCalledWith('evt-1');
  });

  it('should handle ticket category form validation and cancel editing flows', () => {
    const component = fixture.componentInstance;

    component.openAddTicketCategoryForm('evt-1');
    component.ticketCategoryForm.setValue({ name: '', price: 0, totalSeats: 0 });
    component.submitTicketCategoryForm('evt-1');
    expect(eventService.addTicketCategory).not.toHaveBeenCalled();

    component.cancelTicketCategoryForm();
    expect(component.addingTicketCategoryForEventId()).toBeNull();

    component.cancelEventForm();
    expect(component.showAddEventForm()).toBeFalse();
  });

  it('should show the refund notice only when the event has active bookings', () => {
    const component = fixture.componentInstance;
    spyOn(window, 'confirm').and.returnValue(true);
    bookingService.cancelForEvent.and.returnValue(of(void 0));
    eventService.delete.and.returnValue(of(void 0));

    component.deleteEvent({
      id: 'evt-1',
      title: 'Angular Summit',
      categoryName: 'Tech',
      eventDate: '2026-09-20T18:00:00Z',
      venue: 'Bengaluru',
      active: true,
      ticketCategories: [{ id: 1, name: 'General', price: 499, totalSeats: 100, availableSeats: 50, totalBooked: 0 }]
    });

    expect(toastService.show).not.toHaveBeenCalled();

    component.deleteEvent({
      id: 'evt-2',
      title: 'Another Event',
      categoryName: 'Tech',
      eventDate: '2026-09-21T18:00:00Z',
      venue: 'Hyderabad',
      active: true,
      ticketCategories: [{ id: 2, name: 'VIP', price: 899, totalSeats: 20, availableSeats: 8, totalBooked: 12 }]
    });

    expect(toastService.show).toHaveBeenCalledWith(
      'Refund process has been initiated for all confirmed bookings.',
      'success',
      0
    );
  });
});
