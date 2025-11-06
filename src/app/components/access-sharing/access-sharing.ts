import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

interface UserAccess {
  userId: number;
  username: string;
  email: string;
  grantedAt: string;
}

interface UserSearchResult {
  id: number;
  username: string;
  email: string;
}

@Component({
  selector: 'app-access-sharing',
  imports: [CommonModule, FormsModule],
  templateUrl: './access-sharing.html',
  styleUrl: './access-sharing.scss'
})
export class AccessSharingComponent implements OnInit {
  @Input() inventoryId!: number;
  @Input() isOwner = false;

  sharedUsers: UserAccess[] = [];
  searchQuery = '';
  searchResults: UserSearchResult[] = [];
  searching = false;
  loading = false;

  constructor(
    private api: ApiService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadSharedUsers();
  }

  loadSharedUsers(): void {
    if (!this.inventoryId) return;

    this.loading = true;
    this.api.get<any>(`inventories/${this.inventoryId}`).subscribe({
      next: (data) => {
        this.sharedUsers = data.sharedWith || [];
        this.loading = false;
      },
      error: (err) => {
        this.notification.showHttpError(err, 'Failed to load shared users');
        this.loading = false;
      }
    });
  }

  searchUsers(): void {
    if (!this.searchQuery || this.searchQuery.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searching = true;
    this.api.get<UserSearchResult[]>(`users/search?query=${encodeURIComponent(this.searchQuery)}`).subscribe({
      next: (users) => {
        // Filter out users who already have access
        const sharedUserIds = this.sharedUsers.map(u => u.userId);
        this.searchResults = users.filter(u => !sharedUserIds.includes(u.id));
        this.searching = false;
      },
      error: (err) => {
        this.notification.showHttpError(err, 'Failed to search users');
        this.searching = false;
      }
    });
  }

  grantAccess(userId: number): void {
    if (!this.isOwner) {
      this.notification.warning('Only the owner can share this inventory');
      return;
    }

    this.api.post(`inventories/${this.inventoryId}/share`, userId).subscribe({
      next: () => {
        this.notification.success('Access granted successfully');
        this.loadSharedUsers();
        this.searchQuery = '';
        this.searchResults = [];
      },
      error: (err) => {
        this.notification.showHttpError(err, 'Failed to grant access');
      }
    });
  }

  revokeAccess(userId: number, username: string): void {
    if (!this.isOwner) {
      this.notification.warning('Only the owner can revoke access');
      return;
    }

    if (!confirm(`Are you sure you want to revoke access for ${username}?`)) {
      return;
    }

    this.api.delete(`inventories/${this.inventoryId}/share/${userId}`).subscribe({
      next: () => {
        this.notification.success('Access revoked successfully');
        this.loadSharedUsers();
      },
      error: (err) => {
        this.notification.showHttpError(err, 'Failed to revoke access');
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
  }
}
