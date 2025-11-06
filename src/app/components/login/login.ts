import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';
  returnUrl = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.notification.warning('Please enter email and password');
      return;
    }

    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loading = true;
      this.error = '';
      this.cdr.detectChanges();
      
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: () => {
          this.notification.success('Login successful!', 'Welcome back');
          this.router.navigateByUrl(this.returnUrl);
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Login failed. Please try again.';
          this.notification.showHttpError(err, 'Login failed');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }, 0);
  }
}
