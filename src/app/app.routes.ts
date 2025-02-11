import { Routes } from '@angular/router';
import { WelcomeComponent } from './features/welcome/welcome.component';
import { NotFoundComponent } from './layout/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'game',
    loadChildren: () =>
      import('./features/game/game.routes').then((m) => m.gameRoutes),
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./features/user/user.routes').then((m) => m.userRoutes),
  },
  {
    path: 'welcome',
    component: WelcomeComponent,
  },
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  { path: '**', component: NotFoundComponent },
];
