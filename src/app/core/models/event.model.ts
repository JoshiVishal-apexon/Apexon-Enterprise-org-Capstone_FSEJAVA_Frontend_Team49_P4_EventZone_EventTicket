import { TicketCategory, OrganiserTicketCategory } from './ticket-category.model';

/** Summary shape returned by GET /events */
export interface EventSummary {
  id: string;
  title: string;
  categoryName: string;
  eventDate: string;
  venue: string;
  active: boolean;
  coverImageUrl: string;
  minPrice: number;
  maxPrice: number;
  totalBooked?: number;
}

/** Detail shape returned by GET /events/{id} */
export interface EventDetail {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  eventDate: string;
  venue: string;
  coverImageUrl: string;
  active: boolean;
  ticketCategories: TicketCategory[];
}

/** Shape returned by GET /organiser/events */
export interface OrganiserEvent {
  id: string;
  title: string;
  categoryName: string;
  eventDate: string;
  venue: string;
  active: boolean;
  ticketCategories: OrganiserTicketCategory[];
}

export interface CreateEventRequest {
  title: string;
  description: string;
  eventDate: string;
  venue: string;
  coverImageUrl: string;
  categoryId: number;
}

export type UpdateEventRequest = CreateEventRequest;
