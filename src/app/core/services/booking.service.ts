import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, CreateBookingRequest } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly baseUrl = `${environment.apiBaseUrl}/bookings`;

  constructor(private readonly http: HttpClient) {}

  create(request: CreateBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(this.baseUrl, request);
  }

  mine(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/mine`);
  }

  cancel(id: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/${id}/cancel`, {});
  }

  cancelForEvent(eventId: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/event/${eventId}/cancel`, {});
  }
}
