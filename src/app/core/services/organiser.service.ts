import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrganiserEvent } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class OrganiserService {
  private readonly baseUrl = `${environment.apiBaseUrl}/organiser`;

  constructor(private readonly http: HttpClient) {}

  myEvents(): Observable<OrganiserEvent[]> {
    return this.http.get<OrganiserEvent[]>(`${this.baseUrl}/events`);
  }
}
