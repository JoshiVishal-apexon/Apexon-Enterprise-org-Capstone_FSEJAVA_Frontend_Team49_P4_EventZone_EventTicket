import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { OrganiserService } from '../../../core/services/organiser.service';
import { EventService } from '../../../core/services/event.service';
import { BookingService } from '../../../core/services/booking.service';
import { CategoryService } from '../../../core/services/category.service';
import { OrganiserEvent } from '../../../core/models/event.model';
import { Category } from '../../../core/models/category.model';
import {
  CreateTicketCategoryRequest,
  OrganiserTicketCategory,
  TicketCategory
} from '../../../core/models/ticket-category.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-organiser-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './organiser-dashboard.html',
  styleUrl: './organiser-dashboard.scss'
})
export class OrganiserDashboardComponent implements OnInit {
  private readonly organiserService = inject(OrganiserService);
  private readonly eventService = inject(EventService);
  private readonly bookingService = inject(BookingService);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly events = signal<OrganiserEvent[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);

  readonly expandedEventId = signal<string | null>(null);
  readonly showAddEventForm = signal(false);
  readonly editingEventId = signal<string | null>(null);
  readonly addingTicketCategoryForEventId = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly eventForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    eventDate: ['', Validators.required],
    venue: ['', Validators.required],
    coverImageUrl: ['', Validators.required],
    categoryId: [null as number | null, Validators.required],
    ticketCategories: this.fb.array<FormGroup>([], Validators.minLength(1))
  });

  readonly ticketCategoryForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    totalSeats: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.categoryService.list().subscribe({ next: (categories) => this.categories.set(categories) });
    this.loadEvents();
  }

  toggleExpand(eventId: string): void {
    this.expandedEventId.set(this.expandedEventId() === eventId ? null : eventId);
  }

  openAddEventForm(): void {
    this.editingEventId.set(null);
    this.ticketCategoryRows.clear();
    this.eventForm.reset({
      title: '',
      description: '',
      eventDate: '',
      venue: '',
      coverImageUrl: '',
      categoryId: null,
      ticketCategories: []
    });
    this.showAddEventForm.set(true);
  }

  openEditEventForm(event: OrganiserEvent): void {
    this.showAddEventForm.set(true);
    this.editingEventId.set(event.id);
    this.ticketCategoryRows.clear();
    const matchingCategory = this.categories().find((c) => c.name === event.categoryName);
    this.eventForm.setValue({
      title: event.title,
      description: '',
      eventDate: event.eventDate,
      venue: event.venue,
      coverImageUrl: '',
      categoryId: matchingCategory?.id ?? null,
      ticketCategories: []
    });
    this.eventService.getById(event.id).subscribe({
      next: (eventDetail) => {
        if (this.editingEventId() !== event.id) {
          return;
        }
        this.eventForm.patchValue({
          description: eventDetail.description,
          coverImageUrl: eventDetail.coverImageUrl
        });
        this.ticketCategoryRows.clear();
        eventDetail.ticketCategories.forEach((ticketCategory) => {
          this.ticketCategoryRows.push(this.createTicketCategoryRow(ticketCategory));
        });
      }
    });
  }

  cancelEventForm(): void {
    this.showAddEventForm.set(false);
    this.editingEventId.set(null);
  }

  submitEventForm(): void {
    if (this.ticketCategoryRows.length === 0) {
      this.ticketCategoryRows.setErrors({ required: true });
      this.ticketCategoryRows.markAsTouched();
    }

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const raw = this.eventForm.getRawValue();
    if (raw.categoryId === null) {
      return;
    }
    const payload = {
      title: raw.title,
      description: raw.description,
      eventDate: raw.eventDate,
      venue: raw.venue,
      coverImageUrl: raw.coverImageUrl,
      categoryId: raw.categoryId
    };
    const ticketCategories = raw.ticketCategories as Array<
      CreateTicketCategoryRequest & { id: number | null }
    >;

    this.submitting.set(true);
    const editingId = this.editingEventId();
    const request = editingId
      ? this.eventService.update(editingId, payload)
      : this.eventService.create(payload);

    request.subscribe({
      next: (savedEvent) => {
        const categoryRequests: Observable<unknown>[] = ticketCategories.map((ticketCategory) => {
          const { id, ...categoryRequest } = ticketCategory;
          return id === null
            ? this.eventService.addTicketCategory(savedEvent.id, categoryRequest)
            : this.eventService.updateTicketCategory(id, categoryRequest);
        });
        const categoriesRequest = categoryRequests.length ? forkJoin(categoryRequests) : undefined;
        if (!categoriesRequest) {
          this.finishEventSubmit(editingId);
          return;
        }
        categoriesRequest.subscribe({
          next: () => this.finishEventSubmit(editingId),
          error: () => this.submitting.set(false)
        });
      },
      error: () => this.submitting.set(false)
    });
  }

  addTicketCategoryRow(): void {
    this.ticketCategoryRows.push(this.createTicketCategoryRow());
  }

  removeTicketCategoryRow(index: number): void {
    const row = this.ticketCategoryRows.at(index);
    if (row.get('id')?.value === null) {
      this.ticketCategoryRows.removeAt(index);
    }
  }

  get ticketCategoryRows(): FormArray<FormGroup> {
    return this.eventForm.controls.ticketCategories;
  }

  private createTicketCategoryRow(ticketCategory?: OrganiserTicketCategory | TicketCategory): FormGroup {
    return this.fb.group({
      id: [ticketCategory?.id ?? null],
      name: [ticketCategory?.name ?? '', Validators.required],
      price: [ticketCategory?.price ?? 0, [Validators.required, Validators.min(0)]],
      totalSeats: [ticketCategory?.totalSeats ?? 0, [Validators.required, Validators.min(1)]]
    });
  }

  private finishEventSubmit(editingId: string | null): void {
    this.toast.success(editingId ? 'Event updated.' : 'Event created.');
    this.submitting.set(false);
    this.showAddEventForm.set(false);
    this.editingEventId.set(null);
    this.loadEvents();
  }

  private hasActiveBookings(event: OrganiserEvent): boolean {
    return event.ticketCategories.some((ticketCategory) => (ticketCategory.totalBooked ?? 0) > 0);
  }

  deleteEvent(event: OrganiserEvent): void {
    const confirmed = window.confirm(
      `Cancel event "${event.title}"? Any existing bookings will be cancelled and refunded.`
    );
    if (!confirmed) {
      return;
    }
    this.bookingService.cancelForEvent(event.id).subscribe({
      next: () => {
        this.eventService.delete(event.id).subscribe({
          next: () => {
            if (this.hasActiveBookings(event)) {
              this.toast.show(
                'Refund process has been initiated for all confirmed bookings.',
                'success',
                0
              );
            }
            this.loadEvents();
          }
        });
      }
    });
  }

  openAddTicketCategoryForm(eventId: string): void {
    this.addingTicketCategoryForEventId.set(eventId);
    this.ticketCategoryForm.reset({ name: '', price: 0, totalSeats: 0 });
  }

  cancelTicketCategoryForm(): void {
    this.addingTicketCategoryForEventId.set(null);
  }

  submitTicketCategoryForm(eventId: string): void {
    if (this.ticketCategoryForm.invalid) {
      this.ticketCategoryForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.eventService.addTicketCategory(eventId, this.ticketCategoryForm.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Ticket category added.');
        this.submitting.set(false);
        this.addingTicketCategoryForEventId.set(null);
        this.loadEvents();
      },
      error: () => this.submitting.set(false)
    });
  }

  private loadEvents(): void {
    this.loading.set(true);
    this.organiserService.myEvents().subscribe({
      next: (events) => {
        this.events.set(events);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
