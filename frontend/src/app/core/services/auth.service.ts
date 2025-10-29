import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../types/user.type';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from '../types/auth.type';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService
  ) {
    const user = this.tokenService.getUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  login(loginCredentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, loginCredentials)
      .pipe(
        tap((response) => this.handleAuthResponse(response)),
        catchError((error) => {
          console.error('Ocurrió un error durante el login:', error);
          return throwError(() => error);
        })
      );
  }

  register(userData: RegisterData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData)
      .pipe(
        tap((response) => this.handleAuthResponse(response)),
        catchError((error) => {
          console.error('Ocurrió un error durante el registro:', error);
          return throwError(() => error);
        })
      );
  }

  refreshToken(): Observable<{ access_token: string }> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No hay token de refresco disponible'));
    }

    return this.http
      .post<{ access_token: string }>(`${environment.apiUrl}/auth/refresh`, {
        refresh_token: refreshToken,
      })
      .pipe(
        tap((response) => {
          this.tokenService.updateAccessToken(response.access_token);
        }),
        catchError((error) => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasValidTokens();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.tokenService.saveTokens(response);
    this.currentUserSubject.next(response.user);
  }
}
