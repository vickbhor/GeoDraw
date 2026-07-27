import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

const API = 'http://localhost:5000/api/auth';

@Service()
export class Auth {
  private http = inject(HttpClient);

  private userSubject = new BehaviorSubject<any>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  login(email: string, password: string) {
    return this.http.post<any>(`${API}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  register(name: string, email: string, password: string) {
    return this.http.post(`${API}/register`, { name, email, password });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  get token() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.token;
  }

  private getStoredUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
}