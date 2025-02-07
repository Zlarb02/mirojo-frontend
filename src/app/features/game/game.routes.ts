import { Routes } from "@angular/router";
import { DiceRollComponent } from "./dice-roll/dice-roll.component";
import { connectedGuard } from "../../core/guards/auth.guard";
import { newGameRoutes } from "./new-game/new-game.routes";

export const gameRoutes: Routes = [
  {
    path: "",
    children: [
      { path: "dice-roll", component: DiceRollComponent },
      {
        // On délègue les routes de "new-game" à newGameRoutes
        path: "new-game",
        children: newGameRoutes,
      },
      { path: "", redirectTo: "new-game/universes", pathMatch: "full" },
    ],
  },
];
