import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  isBlocked: boolean;
  preferredLanguage: string;
  preferredTheme: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor(private api: ApiService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/register', request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.isAdmin ?? false;
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (this.isBrowser) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      document.documentElement.setAttribute('data-theme', response.user.preferredTheme);
    }
    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) return;
    
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        document.documentElement.setAttribute('data-theme', user.preferredTheme);
      } catch (e) {
        this.logout();
      }
    }
  }

  updatePreferences(language: string, theme: string): Observable<any> {
    return this.api.put('users/me/preferences', { language, theme }).pipe(
      tap(() => {
        const user = this.currentUser();
        if (user && this.isBrowser) {
          user.preferredLanguage = language;
          user.preferredTheme = theme;
          this.currentUser.set(user);
          localStorage.setItem('user', JSON.stringify(user));
          document.documentElement.setAttribute('data-theme', theme);
        }
      })
    );
  }
}
