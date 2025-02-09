import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  router = inject(Router);
  isCollapsed: boolean = true;

  toggleNavbar() {
    this.isCollapsed = !this.isCollapsed;
  }

  authService = inject(AuthService);
  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigateByUrl('auth/login');
    });
  }

  toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }
}
