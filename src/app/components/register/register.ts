import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    // Validation
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.notification.warning('Please fill in all fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      this.notification.error('Passwords do not match');
      return;
    }

    if (this.password.length < 6) {
      this.notification.warning('Password must be at least 6 characters');
      return;
    }

    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loading = true;
      this.error = '';
      this.cdr.detectChanges();
      
      this.authService.register({ 
        username: this.username, 
        email: this.email, 
        password: this.password 
      }).subscribe({
        next: () => {
          this.notification.success('Registration successful! Welcome!', 'Success');
          this.router.navigate(['/dashboard']);
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Registration failed. Please try again.';
          this.notification.showHttpError(err, 'Registration failed');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }, 0);
  }
}
