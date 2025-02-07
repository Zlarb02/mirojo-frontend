import { Routes } from "@angular/router";
import { UniverseComponent } from "./universe.component";

export const universeRoutes: Routes = [
  {
    path: "",
    component: UniverseComponent,
    // Vous pouvez ajouter ici d'autres routes enfants si nécessaire, par exemple :
    // { path: 'details', component: UniverseDetailComponent },
    // { path: 'characters', component: UniverseCharactersComponent },
    // { path: 'items', component: UniverseItemsComponent },
  },
];
