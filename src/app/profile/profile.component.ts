import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvatarComponent,
    FooterComponent,
  ], // Ajout de ReactiveFormsModule et AvatarComponent
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: any = null; // Stocke l'utilisateur connecté
  loading = false;
  updateProfileForm!: FormGroup;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  async ngOnInit() {
    this.loading = true;
    const session = this.supabase.session;
    if (session) {
      this.user = session.user;
      const { data, error } = await this.supabase.profile(this.user);
      if (!error) {
        this.user = { ...this.user, ...data };
      }
    } else {
      this.router.navigate(['/login']); // Redirige si non connecté
    }

    // Initialisation du formulaire avec les valeurs du profil
    this.updateProfileForm = this.formBuilder.group({
      username: [this.user?.username || '', Validators.required],
      website: [this.user?.website || ''],
      avatar_url: [this.user?.avatar_url || ''],
    });

    this.loading = false;
  }

  get avatarUrl() {
    return this.updateProfileForm.value.avatar_url as string;
  }

  async updateAvatar(event: string): Promise<void> {
    this.updateProfileForm.patchValue({
      avatar_url: event,
    });
    await this.updateProfile();
  }

  async updateProfile(): Promise<void> {
    if (this.updateProfileForm.invalid) return;

    try {
      this.loading = true;
      const { username, website, avatar_url } = this.updateProfileForm.value;
      const { error } = await this.supabase.updateProfile({
        id: this.user.id,
        username,
        website,
        avatar_url,
      });

      if (error) throw error;
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }

  async signOut() {
    await this.supabase.signOut();
    this.router.navigate(['/login']); // Redirige après déconnexion
  }
}
