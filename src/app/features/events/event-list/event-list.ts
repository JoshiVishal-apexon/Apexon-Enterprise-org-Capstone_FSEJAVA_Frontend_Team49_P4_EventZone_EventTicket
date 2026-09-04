import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { CategoryService } from '../../../core/services/category.service';
import { EventSummary } from '../../../core/models/event.model';
import { Category } from '../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss'
})
export class EventListComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly categoryService = inject(CategoryService);

  readonly events = signal<EventSummary[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly selectedCategory = signal<string>('');
  readonly loading = signal(false);

  ngOnInit(): void {
    this.categoryService.list().subscribe({
      next: (categories) => this.categories.set(categories)
    });
    this.loadEvents();
  }

  onCategoryChange(categoryName: string): void {
    this.selectedCategory.set(categoryName);
    this.loadEvents();
  }

  private loadEvents(): void {
    this.loading.set(true);
    const category = this.selectedCategory() || undefined;
    this.eventService.list(category).subscribe({
      next: (events) => {
        this.events.set(events);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
