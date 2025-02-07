import {
  Component,
  OnInit,
  inject,
  signal,
  Signal,
  computed,
  WritableSignal,
} from "@angular/core";
import { GameQueryService } from "../../../core/services/game-query.service";
import { GameStateService } from "../../../core/services/game-state.service";
import { AuthService } from "../../../core/services/auth.service";
import { RouterOutlet } from "@angular/router";
import { UniversesComponent } from "./universes/universes.component";

@Component({
  selector: "app-new-game",
  standalone: true,
  imports: [RouterOutlet, UniversesComponent],
  templateUrl: "./new-game.component.html",
  styleUrls: ["./new-game.component.scss"],
})
export class NewGameComponent implements OnInit {
  private queryService = inject(GameQueryService);
  private stateService = inject(GameStateService);
  private authService = inject(AuthService);

  // Signal pour stocker la liste globale des univers
  universes = signal<any[]>([]);

  // Signal modifiable pour le formulaire de création d'univers
  newUniverse: WritableSignal<{
    name: string;
    description: string;
    is_public: boolean;
  }> = signal({ name: "", description: "", is_public: false });

  // L'univers sélectionné est récupéré depuis le service
  selectedUniverse = this.stateService.currentState().selectedUniverse;

  // Signaux computed qui se recalculent automatiquement dès que 'universes' change
  userUniverses = computed(() => {
    const currentUser = this.authService.currentUser();
    return currentUser
      ? this.universes().filter((u) => u.created_by === currentUser.id)
      : [];
  });

  publicUniverses = computed(() => {
    return this.universes().filter((u) => u.is_public === true);
  });

  mirojoUniverses = computed(() => {
    return this.universes().filter(
      (u) => u.created_by === "d57e74dd-a15b-4e99-b59a-b679c2c5d0ed",
    );
  });
  ngOnInit(): void {
    this.loadUniverses();
  }

  loadUniverses(): void {
    this.queryService.getUniverses().subscribe({
      next: (response) => {
        if (response.error) {
          console.error(
            "Erreur lors de la récupération des univers :",
            response.error,
          );
          return;
        }
        // Mise à jour du signal universes ; les signaux computed se recalculent automatiquement
        this.universes.set(response.data);
      },
      error: (err) => console.error("Erreur dans le service:", err),
    });
  }
  selectUniverse(universe: any): void {
    console.log("called");
    this.stateService.setSelectedUniverse(universe);
    this.selectedUniverse = this.stateService.currentState().selectedUniverse;
  }

  deselectUniverse(): void {
    this.stateService.setSelectedUniverse(null);
    this.selectedUniverse = this.stateService.currentState().selectedUniverse;
  }

  createUniverse(): void {
    console.log("coucou du parent");
    const currentUser = this.authService.currentUser();
    console.log(this.newUniverse);
    const payload = {
      ...this.newUniverse(),
      created_by: currentUser?.id,
    };
    this.queryService.createUniverse(payload).subscribe({
      next: (response) => {
        if (response.error) {
          console.error(
            "Erreur lors de la création de l'univers :",
            response.error,
          );
          return;
        }
        this.newUniverse.set({ name: "", description: "", is_public: false });
        this.loadUniverses();
      },
      error: (err) => console.error("Erreur dans le service:", err),
    });
  }

  deleteUniverse(id: any): void {
    console.log(id);
    this.queryService.deleteUniverse(id).subscribe({
      next: (response) => {
        if (response.error) {
          console.error(
            "Erreur lors de la suppression de l'univers :",
            response.error,
          );
          return;
        }
        this.loadUniverses();
      },
      error: (err) => console.error("Erreur dans le service:", err),
    });
  }
}
