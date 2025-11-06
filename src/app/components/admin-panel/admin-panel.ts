import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanelComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  error = '';
  searchQuery = '';
  currentUserId: number | null = null;

  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.currentUserId = currentUser.id;
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.usersService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load users.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }

  blockUser(user: User): void {
    if (!confirm(`Are you sure you want to block user "${user.username}"?`)) {
      return;
    }

    this.usersService.blockUser(user.id).subscribe({
      next: () => {
        user.isBlocked = true;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to block user.';
      }
    });
  }

  unblockUser(user: User): void {
    this.usersService.unblockUser(user.id).subscribe({
      next: () => {
        user.isBlocked = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to unblock user.';
      }
    });
  }

  grantAdmin(user: User): void {
    if (!confirm(`Are you sure you want to grant admin privileges to "${user.username}"?`)) {
      return;
    }

    this.usersService.grantAdmin(user.id).subscribe({
      next: () => {
        user.isAdmin = true;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to grant admin.';
      }
    });
  }

  revokeAdmin(user: User): void {
    if (!confirm(`Are you sure you want to revoke admin privileges from "${user.username}"?`)) {
      return;
    }

    this.usersService.revokeAdmin(user.id).subscribe({
      next: () => {
        user.isAdmin = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to revoke admin.';
      }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Are you sure you want to permanently delete user "${user.username}"? This action cannot be undone.`)) {
      return;
    }

    this.usersService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.applyFilter();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete user.';
      }
    });
  }

  isCurrentUser(user: User): boolean {
    return user.id === this.currentUserId;
  }

  get adminCount(): number {
    return this.users.filter(u => u.isAdmin).length;
  }

  get blockedCount(): number {
    return this.users.filter(u => u.isBlocked).length;
  }

  get activeCount(): number {
    return this.users.filter(u => !u.isBlocked).length;
  }
}
