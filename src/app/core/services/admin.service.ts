import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';
import { EventDetail, EventSummary } from '../models/event.model';

export interface UpsertCategoryRequest {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = `${environment.apiBaseUrl}/admin`;

  constructor(private readonly http: HttpClient) {}

  createCategory(request: UpsertCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories`, request);
  }

  updateCategory(id: number, request: UpsertCategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/categories/${id}`, request);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categories/${id}`);
  }

  listEvents(): Observable<EventSummary[]> {
    return this.http.get<EventSummary[]>(`${this.baseUrl}/events`);
  }

  activateEvent(id: string): Observable<EventDetail> {
    return this.http.put<EventDetail>(`${this.baseUrl}/events/${id}/activate`, {});
  }

  deactivateEvent(id: string): Observable<EventDetail> {
    return this.http.put<EventDetail>(`${this.baseUrl}/events/${id}/deactivate`, {});
  }
}
