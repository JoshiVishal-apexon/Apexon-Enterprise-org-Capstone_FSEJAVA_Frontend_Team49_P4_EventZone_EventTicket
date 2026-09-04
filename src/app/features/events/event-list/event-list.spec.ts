import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EventListComponent } from './event-list';
import { EventService } from '../../../core/services/event.service';
import { CategoryService } from '../../../core/services/category.service';

describe('EventListComponent', () => {
  let fixture: ComponentFixture<EventListComponent>;
  let eventService: jasmine.SpyObj<EventService>;
  let categoryService: jasmine.SpyObj<CategoryService>;

  beforeEach(async () => {
    eventService = jasmine.createSpyObj('EventService', ['list']);
    categoryService = jasmine.createSpyObj('CategoryService', ['list']);

    categoryService.list.and.returnValue(
      of([
        { id: 1, name: 'Music' },
        { id: 2, name: 'Tech' }
      ])
    );
    eventService.list.and.returnValue(
      of([
        {
          id: 'evt-1',
          title: 'Angular Summit',
          categoryName: 'Tech',
          eventDate: '2026-09-20T18:00:00Z',
          venue: 'Bengaluru',
          active: true,
          coverImageUrl: 'https://test.com/image.png',
          minPrice: 499,
          maxPrice: 1499
        }
      ])
    );

    await TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [
        provideRouter([]),
        { provide: EventService, useValue: eventService },
        { provide: CategoryService, useValue: categoryService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventListComponent);
    fixture.detectChanges();
  });

  it('should create the event list component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load categories and events on init', () => {
    expect(categoryService.list).toHaveBeenCalled();
    expect(eventService.list).toHaveBeenCalledWith(undefined);
    expect(fixture.componentInstance.events().length).toBe(1);
  });

  it('should filter by category when a category tab is selected', () => {
    const component = fixture.componentInstance;
    component.onCategoryChange('Music');

    expect(component.selectedCategory()).toBe('Music');
    expect(eventService.list).toHaveBeenCalledWith('Music');
  });
});
