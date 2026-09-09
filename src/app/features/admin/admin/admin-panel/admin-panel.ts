import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../../../core/services/category.service';
import { AdminService } from '../../../../core/services/admin.service';
import { Category } from '../../../../core/models/category.model';
import { EventSummary } from '../../../../core/models/event.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss'
})
export class AdminPanelComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly categories = signal<Category[]>([]);
  readonly events = signal<EventSummary[]>([]);
  readonly loadingCategories = signal(false);
  readonly loadingEvents = signal(false);
  readonly submitting = signal(false);
  readonly editingCategoryId = signal<number | null>(null);
  readonly togglingEventId = signal<string | null>(null);

  readonly categoryForm = this.fb.nonNullable.group({
    name: ['', Validators.required]
  });

  readonly manualEventIdForm = this.fb.nonNullable.group({
    eventId: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadEvents();
  }

  loadCategories(): void {
    this.loadingCategories.set(true);
    this.categoryService.list().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loadingCategories.set(false);
      },
      error: () => this.loadingCategories.set(false)
    });
  }

  loadEvents(): void {
    this.loadingEvents.set(true);
    this.adminService.listEvents().subscribe({
      next: (events) => {
        this.events.set(events);
        this.loadingEvents.set(false);
      },
      error: () => this.loadingEvents.set(false)
    });
  }

  startEditCategory(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.categoryForm.setValue({ name: category.name });
  }

  cancelCategoryEdit(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.reset({ name: '' });
  }

  submitCategoryForm(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const editingId = this.editingCategoryId();
    const request = editingId
      ? this.adminService.updateCategory(editingId, this.categoryForm.getRawValue())
      : this.adminService.createCategory(this.categoryForm.getRawValue());

    request.subscribe({
      next: () => {
        this.toast.success(editingId ? 'Category updated.' : 'Category created.');
        this.submitting.set(false);
        this.cancelCategoryEdit();
        this.loadCategories();
      },
      error: () => this.submitting.set(false)
    });
  }

  deleteCategory(category: Category): void {
    const confirmed = window.confirm(`Delete category "${category.name}"?`);
    if (!confirmed) {
      return;
    }
    this.adminService.deleteCategory(category.id).subscribe({
      next: () => {
        this.toast.success('Category deleted.');
        this.loadCategories();
      }
    });
  }

  activate(eventId: string): void {
    this.togglingEventId.set(eventId);
    this.adminService.activateEvent(eventId).subscribe({
      next: () => {
        this.toast.success(`Event #${eventId} activated.`);
        this.togglingEventId.set(null);
        this.loadEvents();
      },
      error: () => this.togglingEventId.set(null)
    });
  }

  deactivate(eventId: string): void {
    this.togglingEventId.set(eventId);
    this.adminService.deactivateEvent(eventId).subscribe({
      next: () => {
        const event = this.events().find((item) => item.id === eventId);
        if ((event?.totalBooked ?? 0) > 0) {
          this.toast.show('Refund process has been initiated for all confirmed bookings.', 'success', 0);
        }
        this.togglingEventId.set(null);
        this.loadEvents();
      },
      error: () => this.togglingEventId.set(null)
    });
  }

  submitManualActivate(): void {
    const id = this.manualEventIdForm.getRawValue().eventId;
    if (id === null) {
      return;
    }
    this.activate(id);
  }

  submitManualDeactivate(): void {
    const id = this.manualEventIdForm.getRawValue().eventId;
    if (id === null) {
      return;
    }
    this.deactivate(id);
  }
}
