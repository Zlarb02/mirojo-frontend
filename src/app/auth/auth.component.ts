import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, FooterComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
  loading = false;
  signInForm: FormGroup;
  loginForm: FormGroup;
  signUpForm: FormGroup;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router
  ) {
    this.signInForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]], // Magic link
    });

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]], // Connexion email/mot de passe
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.signUpForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]], // Inscription
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // 🔹 Inscription par email et mot de passe
  async signUpWithEmail(): Promise<void> {
    if (this.signUpForm.invalid) return;

    try {
      this.loading = true;
      const { email, password } = this.signUpForm.value;
      const { error } = await this.supabase.signUp(email, password);
      if (error) throw error;

      alert('Compte créé ! Vérifie ton email pour activer ton compte.');
      this.router.navigate(['/login']); // Redirection après inscription
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }

  //  Connexion par Magic Link
  async signInWithMagicLink(): Promise<void> {
    if (this.signInForm.invalid) return;

    try {
      this.loading = true;
      const email = this.signInForm.value.email as string;
      const { error } = await this.supabase.signInWithMagicLink(email);
      if (error) throw error;

      alert('Vérifie ton email pour te connecter !');
      this.router.navigate(['/profile']);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.signInForm.reset();
      this.loading = false;
    }
  }

  //  Connexion par Email/Mot de Passe
  async loginWithEmail(): Promise<void> {
    if (this.loginForm.invalid) return;

    try {
      this.loading = true;
      const { email, password } = this.loginForm.value;
      const { error } = await this.supabase.signInWithPassword(email, password);
      if (error) throw error;

      this.router.navigate(['/profile']);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }

  //  Connexion avec Google
  async signInWithGoogle(): Promise<void> {
    try {
      this.loading = true;
      const { error } = await this.supabase.signInWithOAuth('google');
      if (error) throw error;

      this.router.navigate(['/profile']);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }
}
