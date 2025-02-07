import { Routes } from "@angular/router";
import { NewGameComponent } from "./new-game.component";
import { UniversesComponent } from "./universes/universes.component";
import { universeRoutes } from "./universe/universe.routes";

export const newGameRoutes: Routes = [
  {
    path: "",
    component: NewGameComponent,
    children: [
      {
        path: "universes",
        component: UniversesComponent,
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
