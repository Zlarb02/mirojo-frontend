import { inject } from "@angular/core";
import { Routes, CanActivateFn, Router } from "@angular/router";
import { WelcomeComponent } from "./features/welcome/welcome.component";
import { ProfileComponent } from "./features/auth/profile/profile.component";
import { DiceRollComponent } from "./features/game/dice-roll/dice-roll.component";
import { RegisterComponent } from "./features/auth/register/register.component";
import { LoginComponent } from "./features/auth/login/login.component";
import { AuthService } from "./core/auth.service";

const connected: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      if (!auth.currentUser()?.email) {
        router.navigate(["/login"]);
        resolve(false);
      } else {
        resolve(true);
      }
    }, 0);
  });
};

const unConnected: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      if (auth.currentUser()?.email) {
        router.navigate(["/profile"]);
        resolve(false);
      } else {
        resolve(true);
      }
    }, 0);
  });
};

export const routes: Routes = [
  {
    path: "register",
    component: RegisterComponent,
    canActivate: [unConnected],
  },
  {
    path: "login",
    component: LoginComponent,
    canActivate: [unConnected],
  },
  { path: "profile", component: ProfileComponent, canActivate: [connected] },

  { path: "dice-roll", component: DiceRollComponent },

  { path: "welcome", component: WelcomeComponent },
  { path: "", component: WelcomeComponent },
];
