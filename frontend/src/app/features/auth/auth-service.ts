import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly endpoint = 'auth';

  constructor(private api: ApiService) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.api.post(`${this.endpoint}/login`, credentials);
  }

  signup(data: {
    name: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.api.post(`${this.endpoint}/signup`, data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;

      return Date.now() < exp;
    } catch {
      return false;
    }
  }

  logout() {
    localStorage.removeItem('token');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
