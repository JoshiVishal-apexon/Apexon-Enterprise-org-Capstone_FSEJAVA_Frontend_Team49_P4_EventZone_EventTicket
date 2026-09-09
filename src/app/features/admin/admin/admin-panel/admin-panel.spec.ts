import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminPanelComponent } from './admin-panel';
import { CategoryService } from '../../../../core/services/category.service';
import { AdminService } from '../../../../core/services/admin.service';
import { ToastService } from '../../../../shared/services/toast.service';

describe('AdminPanelComponent', () => {
  let fixture: ComponentFixture<AdminPanelComponent>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let adminService: jasmine.SpyObj<AdminService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    categoryService = jasmine.createSpyObj('CategoryService', ['list']);
    adminService = jasmine.createSpyObj('AdminService', [
      'listEvents',
      'createCategory',
      'updateCategory',
      'deleteCategory',
      'activateEvent',
      'deactivateEvent'
    ]);
    toastService = jasmine.createSpyObj('ToastService', ['success', 'show']);

    categoryService.list.and.returnValue(
      of([
        { id: 1, name: 'Music' },
        { id: 2, name: 'Tech' }
      ])
    );
    adminService.listEvents.and.returnValue(
      of([
        {
          id: 'evt-1',
          title: 'Angular Summit',
          categoryName: 'Tech',
          eventDate: '2026-09-20T18:00:00Z',
          venue: 'Bengaluru',
          active: true,
          coverImageUrl: '',
          minPrice: 499,
          maxPrice: 1499
        }
      ])
    );

    await TestBed.configureTestingModule({
      imports: [AdminPanelComponent],
      providers: [
        { provide: CategoryService, useValue: categoryService },
        { provide: AdminService, useValue: adminService },
        { provide: ToastService, useValue: toastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPanelComponent);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load categories and events on init', () => {
    expect(categoryService.list).toHaveBeenCalled();
    expect(adminService.listEvents).toHaveBeenCalled();
    expect(fixture.componentInstance.categories().length).toBe(2);
    expect(fixture.componentInstance.events().length).toBe(1);
  });

  it('should submit a category form and create a category', () => {
    const component = fixture.componentInstance;
    adminService.createCategory.and.returnValue(of({ id: 3, name: 'Travel' }));

    component.categoryForm.setValue({ name: 'Travel' });
    component.submitCategoryForm();

    expect(adminService.createCategory).toHaveBeenCalledWith({ name: 'Travel' });
    expect(toastService.success).toHaveBeenCalledWith('Category created.');
  });

  it('should activate and deactivate events and delete categories when confirmed', () => {
    const component = fixture.componentInstance;
    spyOn(window, 'confirm').and.returnValue(true);
    adminService.activateEvent.and.returnValue(of({
      id: 'evt-1',
      title: 'Angular Summit',
      description: 'desc',
      categoryName: 'Tech',
      eventDate: '2026-09-20T18:00:00Z',
      venue: 'Bengaluru',
      coverImageUrl: '',
      active: true,
      ticketCategories: []
    }));
    adminService.deactivateEvent.and.returnValue(of({
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
    adminService.deleteCategory.and.returnValue(of(void 0));

    component.activate('evt-1');
    component.deactivate('evt-1');
    component.deleteCategory({ id: 1, name: 'Music' });

    expect(adminService.activateEvent).toHaveBeenCalledWith('evt-1');
    expect(adminService.deactivateEvent).toHaveBeenCalledWith('evt-1');
    expect(adminService.deleteCategory).toHaveBeenCalledWith(1);
    expect(toastService.show).not.toHaveBeenCalled();
  });

  it('should show the refund toast only when the event has active bookings', () => {
    const component = fixture.componentInstance;
    component.events.set([
      {
        id: 'evt-1',
        title: 'No bookings',
        categoryName: 'Tech',
        eventDate: '2026-09-20T18:00:00Z',
        venue: 'Bengaluru',
        active: true,
        coverImageUrl: '',
        minPrice: 499,
        maxPrice: 1499,
        totalBooked: 0
      }
    ]);
    adminService.deactivateEvent.and.returnValue(of({
      id: 'evt-1',
      title: 'No bookings',
      description: 'desc',
      categoryName: 'Tech',
      eventDate: '2026-09-20T18:00:00Z',
      venue: 'Bengaluru',
      coverImageUrl: '',
      active: false,
      ticketCategories: []
    }));

    component.deactivate('evt-1');
    expect(toastService.show).not.toHaveBeenCalled();

    component.events.set([
      {
        id: 'evt-2',
        title: 'Booked event',
        categoryName: 'Tech',
        eventDate: '2026-09-20T18:00:00Z',
        venue: 'Bengaluru',
        active: true,
        coverImageUrl: '',
        minPrice: 499,
        maxPrice: 1499,
        totalBooked: 2
      }
    ]);
    adminService.deactivateEvent.and.returnValue(of({
      id: 'evt-2',
      title: 'Booked event',
      description: 'desc',
      categoryName: 'Tech',
      eventDate: '2026-09-20T18:00:00Z',
      venue: 'Bengaluru',
      coverImageUrl: '',
      active: false,
      ticketCategories: []
    }));

    component.deactivate('evt-2');
    expect(toastService.show).toHaveBeenCalledWith(
      'Refund process has been initiated for all confirmed bookings.',
      'success',
      0
    );
  });
});
