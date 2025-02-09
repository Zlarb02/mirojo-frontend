import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';
import { NavComponent } from '../../../shared/components/nav/nav.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FooterComponent,
    NavComponent,
    FormsModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  authService = inject(AuthService);
  router = inject(Router);

  // Variables pour stocker les nouvelles valeurs saisies
  newUsername = '';
  newFullName = '';
  newAvatarUrl = '';
  newWebsite = '';

  // Flags pour indiquer si chaque champ est en mode édition
  editUsername = false;
  editFullName = false;
  editAvatar = false;
  editWebsite = false;

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigateByUrl('auth/login');
    });
  }

  // Démarrer l'édition d'un champ donné et initialiser la valeur de l'input
  startEdit(field: string): void {
    switch (field) {
      case 'username':
        this.newUsername = this.authService.currentUser()?.username || '';
        this.editUsername = true;
        break;
      case 'fullName':
        this.newFullName = this.authService.currentUser()?.full_name || '';
        this.editFullName = true;
        break;
      case 'website':
        this.newWebsite = this.authService.currentUser()?.website || '';
        this.editWebsite = true;
        break;
      case 'avatar':
        this.newAvatarUrl = this.authService.currentUser()?.avatar_url || '';
        this.editAvatar = true;
        break;
    }
  }

  // Méthodes de mise à jour
  updateUsername() {
    this.authService.updateUsername(this.newUsername).subscribe({
      next: () => {
        alert('Nom d’utilisateur mis à jour !');
        this.editUsername = false;
      },
      error: (err) => alert('Erreur : ' + err.message),
    });
  }

  updateFullName() {
    this.authService.updateFullName(this.newFullName).subscribe({
      next: () => {
        alert('Nom complet mis à jour !');
        this.editFullName = false;
      },
      error: (err) => alert('Erreur : ' + err.message),
    });
  }

  updateAvatarUrl() {
    this.authService.updateAvatarUrl(this.newAvatarUrl).subscribe({
      next: () => {
        alert('URL de l’avatar mise à jour !');
        this.editAvatar = false;
      },
      error: (err) => alert('Erreur : ' + err.message),
    });
  }

  updateWebsite() {
    this.authService.updateWebsite(this.newWebsite).subscribe({
      next: () => {
        alert('Site web mis à jour !');
        this.editWebsite = false;
      },
      error: (err) => alert('Erreur : ' + err.message),
    });
  }

  // Annuler l'édition et réinitialiser l'input à la valeur actuelle
  cancelEdit(field: string) {
    switch (field) {
      case 'username':
        this.newUsername = this.authService.currentUser()?.username || '';
        this.editUsername = false;
        break;
      case 'fullName':
        this.newFullName = this.authService.currentUser()?.full_name || '';
        this.editFullName = false;
        break;
      case 'website':
        this.newWebsite = this.authService.currentUser()?.website || '';
        this.editWebsite = false;
        break;
      case 'avatar':
        this.newAvatarUrl = this.authService.currentUser()?.avatar_url || '';
        this.editAvatar = false;
        break;
    }
  }
}
