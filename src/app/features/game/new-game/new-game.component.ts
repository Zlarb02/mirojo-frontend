import { Component, OnInit, inject, signal, Signal } from '@angular/core';
import { GameQueryService } from '../../../core/services/game-query.service';
import { GameStateService } from '../../../core/services/game-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { RouterOutlet } from '@angular/router';
import { UniversesComponent } from './universes/universes.component';

@Component({
  selector: 'app-new-game',
  standalone: true,
  imports: [RouterOutlet, UniversesComponent],
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.scss'],
})
export class NewGameComponent implements OnInit {
  private queryService = inject(GameQueryService);
  private stateService = inject(GameStateService);
  private authService = inject(AuthService);

  universes = signal<any[]>([]);
  newUniverse = signal({ name: '', description: '', is_public: false });

  // L'univers sélectionné est récupéré depuis le service
  selectedUniverse = this.stateService.currentState().selectedUniverse;

  ngOnInit(): void {
    this.loadUniverses();
  }

  loadUniverses(): void {
    this.queryService.getUniverses().subscribe({
      next: (response) => {
        if (response.error) {
          console.error(
            'Erreur lors de la récupération des univers :',
            response.error
          );
          return;
        }
        this.universes.set(response.data);
      },
      error: (err) => console.error('Erreur dans le service:', err),
    });
  }

  selectUniverse(universe: any): void {
    this.stateService.setSelectedUniverse(universe);
  }

  deselectUniverse(): void {
    this.stateService.setSelectedUniverse(null);
  }

  createUniverse(): void {
    const currentUser = this.authService.currentUser();
    const payload = {
      ...this.newUniverse(),
      created_by: currentUser?.id,
    };
    this.queryService.createUniverse(payload).subscribe({
      next: (response) => {
        if (response.error) {
          console.error(
            "Erreur lors de la création de l'univers :",
            response.error
          );
          return;
        }
        this.newUniverse.set({ name: '', description: '', is_public: false });
        this.loadUniverses();
      },
      error: (err) => console.error('Erreur dans le service:', err),
    });
  }

  deleteUniverse(id: any): void {
    this.queryService.deleteUniverse(id).subscribe({
      next: (response) => {
        if (response.error) {
          console.error(
            "Erreur lors de la suppression de l'univers :",
            response.error
          );
          return;
        }
        this.loadUniverses();
      },
      error: (err) => console.error('Erreur dans le service:', err),
    });
  }

  // Lazy loading des univers spécifiques
  loadMirojoUniverses = () => {
    if (this.mirojoUniverses().length === 0) {
      this.mirojoUniverses.set(
        this.universes().filter(
          (u) => u.created_by === 'd57e74dd-a15b-4e99-b59a-b679c2c5d0ed'
        )
      );
    } else {
    }
  };

  loadUserUniverses = () => {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;
    if (this.userUniverses().length === 0) {
      this.userUniverses.set(
        this.universes().filter((u) => u.created_by === currentUser.id)
      );
    } else {
    }
  };

  loadPublicUniverses = () => {
    if (this.publicUniverses().length === 0) {
      this.publicUniverses.set(
        this.universes().filter((u) => u.is_public === true)
      );
    } else {
    }
  };

  // Signals pour stocker les univers
  mirojoUniverses = signal<any[]>([]);
  userUniverses = signal<any[]>([]);
  publicUniverses = signal<any[]>([]);
}
