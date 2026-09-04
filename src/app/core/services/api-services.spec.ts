import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminService } from './admin.service';
import { BookingService } from './booking.service';
import { CategoryService } from './category.service';
import { EventService } from './event.service';
import { OrganiserService } from './organiser.service';

describe('API service methods', () => {
  let adminService: AdminService;
  let bookingService: BookingService;
  let categoryService: CategoryService;
  let eventService: EventService;
  let organiserService: OrganiserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    adminService = TestBed.inject(AdminService);
    bookingService = TestBed.inject(BookingService);
    categoryService = TestBed.inject(CategoryService);
    eventService = TestBed.inject(EventService);
    organiserService = TestBed.inject(OrganiserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('covers admin service endpoints', () => {
    adminService.createCategory({ name: 'Travel' }).subscribe();
    adminService.updateCategory(4, { name: 'Travel updated' }).subscribe();
    adminService.deleteCategory(4).subscribe();
    adminService.listEvents().subscribe();
    adminService.activateEvent('evt-4').subscribe();
    adminService.deactivateEvent('evt-4').subscribe();

    const createReq = httpMock.expectOne((req) => req.method === 'POST' && req.url === 'http://localhost:8080/api/admin/categories');
    createReq.flush({ id: 4, name: 'Travel' });

    const updateReq = httpMock.expectOne((req) => req.method === 'PUT' && req.url === 'http://localhost:8080/api/admin/categories/4');
    updateReq.flush({ id: 4, name: 'Travel updated' });

    const deleteReq = httpMock.expectOne((req) => req.method === 'DELETE' && req.url === 'http://localhost:8080/api/admin/categories/4');
    deleteReq.flush(null);

    const listReq = httpMock.expectOne('http://localhost:8080/api/admin/events');
    listReq.flush([]);

    const activateReq = httpMock.expectOne('http://localhost:8080/api/admin/events/evt-4/activate');
    activateReq.flush({ id: 'evt-4', title: 'X', description: 'Y', categoryName: 'Travel', eventDate: '2026-01-01T10:00:00Z', venue: 'Paris', coverImageUrl: '', active: true, ticketCategories: [] });

    const deactivateReq = httpMock.expectOne('http://localhost:8080/api/admin/events/evt-4/deactivate');
    deactivateReq.flush({ id: 'evt-4', title: 'X', description: 'Y', categoryName: 'Travel', eventDate: '2026-01-01T10:00:00Z', venue: 'Paris', coverImageUrl: '', active: false, ticketCategories: [] });
  });

  it('covers booking service endpoints', () => {
    bookingService.create({ ticketCategoryId: 10, quantity: 2 }).subscribe();
    bookingService.mine().subscribe();
    bookingService.cancel(7).subscribe();
    bookingService.cancelForEvent('evt-9').subscribe();

    const createReq = httpMock.expectOne((req) => req.method === 'POST' && req.url === 'http://localhost:8080/api/bookings');
    createReq.flush({ id: 7, bookingRef: 'BK-7', eventId: 'evt-9', eventTitle: 'Demo', ticketCategoryName: 'VIP', quantity: 2, status: 'CONFIRMED', createdAt: '2026-01-01T10:00:00Z' });

    const mineReq = httpMock.expectOne('http://localhost:8080/api/bookings/mine');
    mineReq.flush([]);

    const cancelReq = httpMock.expectOne((req) => req.method === 'PUT' && req.url === 'http://localhost:8080/api/bookings/7/cancel');
    cancelReq.flush({ id: 7, bookingRef: 'BK-7', eventId: 'evt-9', eventTitle: 'Demo', ticketCategoryName: 'VIP', quantity: 2, status: 'CANCELLED', createdAt: '2026-01-01T10:00:00Z' });

    const cancelForEventReq = httpMock.expectOne((req) => req.method === 'PUT' && req.url === 'http://localhost:8080/api/bookings/event/evt-9/cancel');
    cancelForEventReq.flush(null);
  });

  it('covers category and organiser service endpoints', () => {
    categoryService.list().subscribe();
    organiserService.myEvents().subscribe();

    const categoryReq = httpMock.expectOne('http://localhost:8080/api/categories');
    categoryReq.flush([{ id: 1, name: 'Tech' }]);

    const organiserReq = httpMock.expectOne('http://localhost:8080/api/organiser/events');
    organiserReq.flush([]);
  });

  it('covers event service endpoints including filters and ticket helpers', () => {
    eventService.list().subscribe();
    eventService.list('Tech').subscribe();
    eventService.getById('evt-1').subscribe();
    eventService.create({ title: 'New', description: 'Desc', eventDate: '2026-11-01T18:00:00Z', venue: 'Berlin', coverImageUrl: 'https://img', categoryId: 1 }).subscribe();
    eventService.update('evt-1', { title: 'Upd', description: 'Desc', eventDate: '2026-11-01T18:00:00Z', venue: 'Berlin', coverImageUrl: 'https://img', categoryId: 1 }).subscribe();
    eventService.delete('evt-1').subscribe();
    eventService.addTicketCategory('evt-1', { name: 'VIP', price: 999, totalSeats: 50 }).subscribe();
    eventService.updateTicketCategory(12, { name: 'VIP', price: 899, totalSeats: 40 }).subscribe();
    eventService.deleteTicketCategory(12).subscribe();

    const listReq = httpMock.expectOne((request) =>
      request.method === 'GET' &&
      request.url === 'http://localhost:8080/api/events' &&
      request.params.keys().length === 0
    );
    listReq.flush([]);

    const filteredReq = httpMock.expectOne((request) =>
      request.method === 'GET' &&
      request.url === 'http://localhost:8080/api/events' &&
      request.params.get('category') === 'Tech'
    );
    filteredReq.flush([]);

    const getReq = httpMock.expectOne((request) => request.method === 'GET' && request.url === 'http://localhost:8080/api/events/evt-1');
    getReq.flush({ id: 'evt-1', title: 'One', description: 'Desc', categoryName: 'Tech', eventDate: '2026-11-01T18:00:00Z', venue: 'Berlin', coverImageUrl: '', active: true, ticketCategories: [] });

    const createReq = httpMock.expectOne((request) => request.method === 'POST' && request.url === 'http://localhost:8080/api/events');
    createReq.flush({ id: 'evt-2', title: 'New', description: 'Desc', categoryName: 'Tech', eventDate: '2026-11-01T18:00:00Z', venue: 'Berlin', coverImageUrl: '', active: true, ticketCategories: [] });

    const updateReq = httpMock.expectOne((request) => request.method === 'PUT' && request.url === 'http://localhost:8080/api/events/evt-1');
    updateReq.flush({ id: 'evt-1', title: 'Upd', description: 'Desc', categoryName: 'Tech', eventDate: '2026-11-01T18:00:00Z', venue: 'Berlin', coverImageUrl: '', active: true, ticketCategories: [] });

    const deleteReq = httpMock.expectOne((request) => request.method === 'DELETE' && request.url === 'http://localhost:8080/api/events/evt-1');
    deleteReq.flush(null);

    const addTicketReq = httpMock.expectOne((request) => request.method === 'POST' && request.url === 'http://localhost:8080/api/events/evt-1/ticket-categories');
    addTicketReq.flush({ id: 13, name: 'VIP', price: 999, totalSeats: 50, availableSeats: 50 });

    const updateTicketReq = httpMock.expectOne((request) => request.method === 'PUT' && request.url === 'http://localhost:8080/api/ticket-categories/12');
    updateTicketReq.flush({ id: 12, name: 'VIP', price: 899, totalSeats: 40, availableSeats: 40 });

    const deleteTicketReq = httpMock.expectOne((request) => request.method === 'DELETE' && request.url === 'http://localhost:8080/api/ticket-categories/12');
    deleteTicketReq.flush(null);
  });
});
