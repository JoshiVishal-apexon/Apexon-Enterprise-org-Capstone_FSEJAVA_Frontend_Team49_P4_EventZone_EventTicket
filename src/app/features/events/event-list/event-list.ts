import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
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
export class EventListComponent implements OnInit, OnDestroy {
  private readonly eventService = inject(EventService);
  private readonly categoryService = inject(CategoryService);
  private autoSlideTimer?: ReturnType<typeof setInterval>;

  readonly events = signal<EventSummary[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly selectedCategory = signal<string>('');
  readonly loading = signal(false);
  readonly currentSlide = signal(0);
  readonly heroSlides = [
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1800&q=82',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1800&q=82',
    'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1800&q=82',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1800&q=82',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1800&q=82'
  ];

  ngOnInit(): void {
    this.categoryService.list().subscribe({
      next: (categories) => this.categories.set(categories)
    });
    this.loadEvents();
    this.autoSlideTimer = setInterval(() => this.nextSlide(), 5000);
  }

  ngOnDestroy(): void {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }
  }

  onCategoryChange(categoryName: string): void {
    this.selectedCategory.set(categoryName);
    this.loadEvents();
  }

  nextSlide(): void {
    this.currentSlide.update((slide) => (slide + 1) % this.heroSlides.length);
  }

  selectSlide(slide: number): void {
    this.currentSlide.set(slide);
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
