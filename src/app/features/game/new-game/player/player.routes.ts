import { Routes } from "@angular/router";
import { PlayerComponent } from "./player.component";
export const playerRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "details",
        component: PlayerComponent,
      },
      { path: "", redirectTo: "details", pathMatch: "full" },
    ],
  },
];
