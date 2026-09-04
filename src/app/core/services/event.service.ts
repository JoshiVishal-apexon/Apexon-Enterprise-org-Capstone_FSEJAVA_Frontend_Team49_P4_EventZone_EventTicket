import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateEventRequest, EventDetail, EventSummary, UpdateEventRequest } from '../models/event.model';
import { CreateTicketCategoryRequest, TicketCategory } from '../models/ticket-category.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly baseUrl = `${environment.apiBaseUrl}/events`;

  constructor(private readonly http: HttpClient) {}

  list(category?: string): Observable<EventSummary[]> {
    const params: Record<string, string> = category ? { category } : {};
    return this.http.get<EventSummary[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<EventDetail> {
    return this.http.get<EventDetail>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateEventRequest): Observable<EventDetail> {
    return this.http.post<EventDetail>(this.baseUrl, request);
  }

  update(id: string, request: UpdateEventRequest): Observable<EventDetail> {
    return this.http.put<EventDetail>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  addTicketCategory(eventId: string, request: CreateTicketCategoryRequest): Observable<TicketCategory> {
    return this.http.post<TicketCategory>(`${this.baseUrl}/${eventId}/ticket-categories`, request);
  }

  updateTicketCategory(id: number, request: CreateTicketCategoryRequest): Observable<TicketCategory> {
    return this.http.put<TicketCategory>(`${environment.apiBaseUrl}/ticket-categories/${id}`, request);
  }

  deleteTicketCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/ticket-categories/${id}`);
  }
}
