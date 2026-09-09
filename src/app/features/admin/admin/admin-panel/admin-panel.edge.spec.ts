import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminPanelComponent } from './admin-panel';
import { CategoryService } from '../../../core/services/category.service';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/services/toast.service';

describe('AdminPanelComponent edge cases', () => {
  let fixture: ComponentFixture<AdminPanelComponent>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let adminService: jasmine.SpyObj<AdminService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    categoryService = jasmine.createSpyObj('CategoryService', ['list']);
    adminService = jasmine.createSpyObj('AdminService', [
      'listEvents',
      'activateEvent',
      'deactivateEvent',
      'deleteCategory',
      'createCategory'
    ]);
    toastService = jasmine.createSpyObj('ToastService', ['success', 'show']);

    categoryService.list.and.returnValue(of([]));
    adminService.listEvents.and.returnValue(of([]));

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

  it('should not create a category when the form is invalid', () => {
    fixture.componentInstance.categoryForm.setValue({ name: '' });

    fixture.componentInstance.submitCategoryForm();

    expect(adminService.createCategory).not.toHaveBeenCalled();
    expect(fixture.componentInstance.categoryForm.touched).toBeTrue();
  });

  it('should cancel category editing state', () => {
    const component = fixture.componentInstance;
    component.startEditCategory({ id: 5, name: 'Travel' });
    component.cancelCategoryEdit();

    expect(component.editingCategoryId()).toBeNull();
    expect(component.categoryForm.value.name).toBe('');
  });

  it('should abort category deletion when confirmation is denied', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const component = fixture.componentInstance;

    component.deleteCategory({ id: 2, name: 'Tech' });

    expect(adminService.deleteCategory).not.toHaveBeenCalled();
  });

  it('should ignore manual event actions when no id is provided', () => {
    const component = fixture.componentInstance;
    component.manualEventIdForm.setValue({ eventId: null as any });

    component.submitManualActivate();
    component.submitManualDeactivate();

    expect(adminService.activateEvent).not.toHaveBeenCalled();
    expect(adminService.deactivateEvent).not.toHaveBeenCalled();
  });
});
