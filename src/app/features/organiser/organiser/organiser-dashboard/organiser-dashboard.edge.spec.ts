import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OrganiserDashboardComponent } from './organiser-dashboard';
import { OrganiserService } from '../../../../core/services/organiser.service';
import { EventService } from '../../../../core/services/event.service';
import { BookingService } from '../../../../core/services/booking.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ToastService } from '../../../../shared/services/toast.service';

describe('OrganiserDashboardComponent edge cases', () => {
  let fixture: ComponentFixture<OrganiserDashboardComponent>;
  let organiserService: jasmine.SpyObj<OrganiserService>;
  let eventService: jasmine.SpyObj<EventService>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    organiserService = jasmine.createSpyObj('OrganiserService', ['myEvents']);
    eventService = jasmine.createSpyObj('EventService', ['addTicketCategory', 'create']);
    bookingService = jasmine.createSpyObj('BookingService', ['cancelForEvent']);
    categoryService = jasmine.createSpyObj('CategoryService', ['list']);
    toastService = jasmine.createSpyObj('ToastService', ['success', 'show']);

    organiserService.myEvents.and.returnValue(of([]));
    categoryService.list.and.returnValue(of([{ id: 1, name: 'Tech' }]));
    eventService.addTicketCategory.and.returnValue(of({ id: 10, name: 'VIP', price: 999, totalSeats: 50, availableSeats: 50 }));

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

  it('should not submit ticket category form with invalid fields', () => {
    const component = fixture.componentInstance;
    component.ticketCategoryForm.setValue({ name: '', price: -1, totalSeats: 0 });

    component.submitTicketCategoryForm('evt-1');

    expect(eventService.addTicketCategory).not.toHaveBeenCalled();
    expect(component.ticketCategoryForm.touched).toBeTrue();
  });

  it('should toggle expansion state for an event', () => {
    const component = fixture.componentInstance;
    component.toggleExpand('evt-1');

    expect(component.expandedEventId()).toBe('evt-1');
  });

  it('should abort delete event when confirmation is denied', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const component = fixture.componentInstance;

    component.deleteEvent({
      id: 'evt-1',
      title: 'Angular Summit',
      categoryName: 'Tech',
      eventDate: '2026-09-20T18:00:00Z',
      venue: 'Bengaluru',
      active: true,
      ticketCategories: []
    });

    expect(bookingService.cancelForEvent).not.toHaveBeenCalled();
  });

  it('should remove unsaved ticket rows and toggle expansion back off', () => {
    const component = fixture.componentInstance;
    component.addTicketCategoryRow();
    component.ticketCategoryRows.at(0).patchValue({ id: null, name: 'VIP', price: 999, totalSeats: 50 });

    component.toggleExpand('evt-1');
    component.toggleExpand('evt-1');
    component.removeTicketCategoryRow(0);

    expect(component.expandedEventId()).toBeNull();
    expect(component.ticketCategoryRows.length).toBe(0);
  });
});
