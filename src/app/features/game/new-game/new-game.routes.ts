import { Routes } from "@angular/router";
import { NewGameComponent } from "./new-game.component";
import { UniversesComponent } from "./universes/universes.component";
import { universeRoutes } from "./universe/universe.routes";
import { PlayersComponent } from "./players/players.component";
import { PlayerComponent } from "./player/player.component";
import { playerRoutes } from "./player/player.routes";

export const newGameRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "player/:id",
        children: playerRoutes,
      },
      {
        path: "players",
        component: PlayersComponent,
      },
      {
        path: "universes",
        component: NewGameComponent,
      },
      {
        path: "universe/:id",
        // On délègue les routes spécifiques de l'univers à universeRoutes
        children: universeRoutes,
      },
      { path: "", redirectTo: "universes", pathMatch: "full" },
    ],
  },
];
