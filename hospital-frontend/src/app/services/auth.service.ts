import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        const username = this.decodeJwtUsername(response.token);
        const user: User = { username, token: response.token, role: response.role };
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'ADMIN';
  }

  isDepartmentStaff(): boolean {
    return this.currentUserValue?.role === 'DEPARTMENT_STAFF';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getDashboardRoute(): string {
    return '/dashboard';
  }

  private decodeJwtUsername(token: string): string {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.sub ?? '';
    } catch {
      return '';
    }
  }
}
