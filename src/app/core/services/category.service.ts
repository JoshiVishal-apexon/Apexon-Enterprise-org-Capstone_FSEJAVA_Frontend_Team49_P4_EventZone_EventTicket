import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly baseUrl = `${environment.apiBaseUrl}/categories`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }
}
