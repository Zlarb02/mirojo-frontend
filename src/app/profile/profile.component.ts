import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { FooterComponent } from "../footer/footer.component";
import { AuthService } from "../services/auth.service";
import { NavComponent } from "../nav/nav.component";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FooterComponent,
    NavComponent,
    FormsModule,
  ], // Ajout de ReactiveFormsModule et AvatarComponent
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent {
  authService = inject(AuthService);
  router = inject(Router);
  newUsername = "";
  newFullName = "";
  newAvatarUrl = "";
  newWebsite = "";

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigateByUrl("/login");
    });
  }

  updateUsername() {
    this.authService.updateUsername(this.newUsername).subscribe({
      next: () => alert("Nom d’utilisateur mis à jour !"),
      error: (err) => alert("Erreur : " + err.message),
    });
  }

  updateFullName() {
    this.authService.updateFullName(this.newFullName).subscribe({
      next: () => alert("Nom complet mis à jour !"),
      error: (err) => alert("Erreur : " + err.message),
    });
  }

  updateAvatarUrl() {
    this.authService.updateAvatarUrl(this.newAvatarUrl).subscribe({
      next: () => alert("URL de l’avatar mise à jour !"),
      error: (err) => alert("Erreur : " + err.message),
    });
  }

  updateWebsite() {
    this.authService.updateWebsite(this.newWebsite).subscribe({
      next: () => alert("Site web mis à jour !"),
      error: (err) => alert("Erreur : " + err.message),
    });
  }
}
