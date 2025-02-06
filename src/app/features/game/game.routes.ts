// src/app/features/game/game.routes.ts
import { Routes } from "@angular/router";
import { DiceRollComponent } from "./dice-roll/dice-roll.component";
// Importez d'autres composants liés au jeu si nécessaire
import { connectedGuard } from "../../core/guards/auth.guard";
import { NewGameComponent } from "./new-game/new-game.component";

export const gameRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "dice-roll",
        component: DiceRollComponent,
        // Vous pouvez ajouter des guards ou d'autres données si besoin
      },
      {
        path: "new",
        component: NewGameComponent,
      },
      {
        path: "",
        redirectTo: "new",
        pathMatch: "full",
      },
    ],
  },
];
