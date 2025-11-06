import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  toggleTheme(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      const newTheme = currentUser.preferredTheme === 'light' ? 'dark' : 'light';
      this.authService.updatePreferences(currentUser.preferredLanguage, newTheme).subscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
