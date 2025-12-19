import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get(endpoint: string, options: any = {}): Observable<any> {
    return this.http.get(`${this.baseUrl}/${endpoint}`, options);
  }

  post(endpoint: string, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${endpoint}`, payload);
  }

  patch(endpoint: string, payload: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${endpoint}`, payload);
  }

  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${endpoint}`);
  }
}
