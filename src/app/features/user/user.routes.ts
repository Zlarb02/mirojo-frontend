// src/app/features/user/user.routes.ts
import { Routes } from "@angular/router";
import { ProfileComponent } from "./profile/profile.component";
import { connectedGuard } from "../../core/guards/auth.guard";

export const userRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "profile",
        component: ProfileComponent,
        canActivate: [connectedGuard],
      },
      // Ajoutez ici d'autres routes pour le user, par exemple, gestion de compte, paramètres, etc.
      {
        path: "",
        redirectTo: "profile",
        pathMatch: "full",
      },
    ],
  },
];
