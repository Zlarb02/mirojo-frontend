import { Routes } from "@angular/router";
import { UniverseDetailsComponent } from "./universe-details/universe-details.component";
import { EnemiesComponent } from "./enemies/enemies.component";
import { ItemsComponent } from "./items/items.component";
import { gameStateGuard } from "../../../../core/guards/game-state.guard";

export const universeRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "details",
        component: UniverseDetailsComponent,
        canActivate: [gameStateGuard],
      },
      { path: "", redirectTo: "details", pathMatch: "full" },
      {
        path: "enemies",
        component: EnemiesComponent,
        canActivate: [gameStateGuard],
      },
      {
        path: "items",
        component: ItemsComponent,
        canActivate: [gameStateGuard],
      },
    ],
  },
];
