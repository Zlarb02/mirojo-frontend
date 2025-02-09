import { Routes } from '@angular/router';
import { UniverseDetailsComponent } from './universe-details/universe-details.component';
import { EnemiesComponent } from './enemies/enemies.component';
import { ItemsComponent } from './items/items.component';

export const universeRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'details',
        component: UniverseDetailsComponent,
      },
      { path: '', redirectTo: 'details', pathMatch: 'full' },
      {
        path: 'enemies',
        component: EnemiesComponent,
      },
      {
        path: 'items',
        component: ItemsComponent,
      },
    ],
  },
];
