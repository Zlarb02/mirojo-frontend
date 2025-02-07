// src/app/features/game/game.routes.ts
import { Routes } from '@angular/router';
import { DiceRollComponent } from './dice-roll/dice-roll.component';
import { connectedGuard } from '../../core/guards/auth.guard';
import { UniverseComponent } from './new-game/universe/universe.component';
import { UniversesComponent } from './new-game/universes/universes.component';
import { NewGameComponent } from './new-game/new-game.component';

export const gameRoutes: Routes = [
  {
    path: '',
    children: [
      { path: 'dice-roll', component: DiceRollComponent },
      {
        path: 'new-game',
        component: NewGameComponent,
        children: [
          {
            path: 'universes',
            component: NewGameComponent,
          },
          {
            path: 'universe/:id',
            component: UniverseComponent,
            children: [
              // Par exemple, route par défaut pour le détail de l'univers.
              //{ path: '', component: UniverseDetailComponent },
              // Autres routes pour les sous-pages (personnages, objets, etc.)
              //{ path: 'characters', component: UniverseCharactersComponent },
              //{ path: 'items', component: UniverseItemsComponent },
              // ...
            ],
          },
          { path: '', redirectTo: 'universes', pathMatch: 'full' },
        ],
      },
      { path: '', redirectTo: 'new-game/universes', pathMatch: 'full' },
      { path: '**', redirectTo: 'new-game/universes' },
    ],
  },
];
