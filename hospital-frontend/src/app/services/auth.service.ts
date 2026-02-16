import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest, AuthResponse, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = 'http://localhost:3000/api/auth'; // Update with your backend API URL

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize with user from localStorage if available
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
    // For demo purposes, this simulates a login
    // Replace with actual HTTP call: return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)

    return of({
      user: {
        id: '1',
        email: credentials.email,
        username: credentials.email.split('@')[0],
        role: UserRole.SUPER_ADMIN
      },
      token: 'demo-jwt-token-' + Math.random().toString(36).substr(2, 9),
      message: 'Login successful'
    }).pipe(
      tap(response => {
        // Store user details and token in local storage
        const user = { ...response.user, token: response.token };
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );

    // Uncomment this for real API integration:
    // return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
    //   tap(response => {
    //     const user = { ...response.user, token: response.token };
    //     localStorage.setItem('currentUser', JSON.stringify(user));
    //     localStorage.setItem('token', response.token);
    //     this.currentUserSubject.next(user);
    //   }),
    //   catchError(error => {
    //     console.error('Login error:', error);
    //     throw error;
    //   })
    // );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    // For demo purposes, this simulates a registration
    // Replace with actual HTTP call: return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)

    return of({
      user: {
        id: Math.random().toString(36).substr(2, 9),
        email: userData.email,
        username: userData.username,
        role: UserRole.SUPER_ADMIN
      },
      token: 'demo-jwt-token-' + Math.random().toString(36).substr(2, 9),
      message: 'Registration successful. Please verify your email.'
    }).pipe(
      // Note: NOT storing user in localStorage - user must login after registration
      tap(response => {
        console.log('User registered:', response.user.email);
        // Here you would trigger email verification
      }),
      catchError(error => {
        console.error('Registration error:', error);
        throw error;
      })
    );

    // Uncomment this for real API integration:
    // return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
    //   tap(response => {
    //     const user = { ...response.user, token: response.token };
    //     localStorage.setItem('currentUser', JSON.stringify(user));
    //     localStorage.setItem('token', response.token);
    //     this.currentUserSubject.next(user);
    //   }),
    //   catchError(error => {
    //     console.error('Registration error:', error);
    //     throw error;
    //   })
    // );
  }

  logout(): void {
    // Remove user from local storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Helper method to get auth headers
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Helper method to get dashboard route based on user role
  getDashboardRoute(role: UserRole): string {
    return '/dashboard';
  }
}
