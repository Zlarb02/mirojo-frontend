import { inject } from '@angular/core';
import { Routes, CanActivateFn, Router } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { ProfileComponent } from './profile/profile.component';
import { DiceRollComponent } from './dice-roll/dice-roll.component';
import { AuthComponent } from './auth/auth.component';
import { SupabaseService } from './services/supabase.service';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';

const authGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  console.log('🔍 authGuard exécuté. Session =', supabase.session);

  if (!supabase.session) {
    console.log('🔴 Redirection vers /login');
    router.navigate(['/login']);
    return false;
  }

  return true;
};

export const routes: Routes = [
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'dice-roll', component: DiceRollComponent },
];
