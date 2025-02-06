// src/app/core/guards/auth.guard.ts
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const connectedGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      if (!auth.currentUser()?.email) {
        router.navigate(["/auth/login"]);
        resolve(false);
      } else {
        resolve(true);
      }
    }, 0);
  });
};

export const unConnectedGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      if (auth.currentUser()?.email) {
        router.navigate(["/user/profile"]);
        resolve(false);
      } else {
        resolve(true);
      }
    }, 0);
  });
};
