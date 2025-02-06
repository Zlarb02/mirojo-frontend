// src/app/features/auth/auth.routes.ts
import { Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { unConnectedGuard } from "../../core/guards/auth.guard";

export const authRoutes: Routes = [
  {
    path: "login",
    component: LoginComponent,
    canActivate: [unConnectedGuard],
  },
  {
    path: "register",
    component: RegisterComponent,
    canActivate: [unConnectedGuard],
  },
];
