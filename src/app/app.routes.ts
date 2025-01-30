import { inject } from '@angular/core';
import { Routes, CanActivateFn, Router } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { ProfileComponent } from './profile/profile.component';
import { DiceRollComponent } from './dice-roll/dice-roll.component';
import { AuthComponent } from './auth/auth.component';
import { SupabaseService } from './services/supabase.service';

const authGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (!supabase.session) {
    router.navigate(['/login']); // Redirige si non connecté
    return false;
  }
  return true;
};

export const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'login', component: AuthComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'dice-roll', component: DiceRollComponent },
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
];
