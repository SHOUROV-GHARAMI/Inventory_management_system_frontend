import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  isBlocked: boolean;
  preferredLanguage?: string;
  preferredTheme?: string;
  createdAt: Date;
}

export interface UserSearchResult {
  id: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private api: ApiService) {}

  getAllUsers(): Observable<User[]> {
    return this.api.get<User[]>('users');
  }

  searchUsers(query: string): Observable<UserSearchResult[]> {
    return this.api.get<UserSearchResult[]>('users/search', { query });
  }

  blockUser(userId: number): Observable<void> {
    return this.api.post<void>(`users/${userId}/block`, {});
  }

  unblockUser(userId: number): Observable<void> {
    return this.api.post<void>(`users/${userId}/unblock`, {});
  }

  grantAdmin(userId: number): Observable<void> {
    return this.api.post<void>(`users/${userId}/grant-admin`, {});
  }

  revokeAdmin(userId: number): Observable<void> {
    return this.api.post<void>(`users/${userId}/revoke-admin`, {});
  }

  deleteUser(userId: number): Observable<void> {
    return this.api.delete<void>(`users/${userId}`);
  }
}
