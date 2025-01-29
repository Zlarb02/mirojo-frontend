import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { DiceRollComponent } from './dice-roll/dice-roll.component';
import { AuthComponent } from './auth/auth.component';

export const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'login', component: AuthComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'dice-roll', component: DiceRollComponent },
  { path: '', redirectTo: '/dice-roll', pathMatch: 'full' },
];
