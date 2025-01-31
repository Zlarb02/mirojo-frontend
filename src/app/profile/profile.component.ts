import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
import { AvatarComponent } from '../avatar/avatar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../services/auth.service';
import { NavComponent } from '../nav/nav.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvatarComponent,
    FooterComponent,
    NavComponent,
  ], // Ajout de ReactiveFormsModule et AvatarComponent
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  authService = inject(AuthService);
  router = inject(Router);

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigateByUrl('/login');
    });
  }
}
