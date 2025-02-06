import { Component, OnInit, inject } from "@angular/core";
import { GameQueryService } from "../../../core/services/game-query.service";
import { GameStateService } from "../../../core/services/game-state.service";
import { AuthService } from "../../../core/services/auth.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { VisibilityToggleDirective } from "../../../shared/directives/ui/visibility-toggle.directive";
import { DisableIfNotOwnerDirective } from "../../../shared/directives/security/disable-if-not-owner.directive";
import { NavComponent } from "../../../shared/components/nav/nav.component";

@Component({
  selector: "app-new-game",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VisibilityToggleDirective,
    DisableIfNotOwnerDirective,
    NavComponent,
  ],
  templateUrl: "./new-game.component.html",
  styleUrls: ["./new-game.component.scss"],
})
export class NewGameComponent implements OnInit {
  private queryService = inject(GameQueryService);
  private stateService = inject(GameStateService);
  private authService = inject(AuthService);

  universes: any[] = [];
  // Nouveau modèle incluant is_public (par défaut true)
  newUniverse = { name: "", description: "", is_public: true };

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
        this.universes = response.data;
      },
      error: (err) => console.error("Erreur dans le service:", err),
    });
  }

  selectUniverse(universe: any): void {
    this.stateService.setSelectedUniverse(universe);
  }

  createUniverse(): void {
    console.log("Créer un nouvel univers:", this.newUniverse);
    // Récupération de l'utilisateur connecté ou, en son absence, utilisation de l'UUID de Mirojo
    const currentUser = this.authService.currentUser();
    const created_by = currentUser
      ? currentUser.id
      : "d57e74dd-a15b-4e99-b59a-b679c2c5d0ed";
    const payload = {
      name: this.newUniverse.name,
      description: this.newUniverse.description,
      is_public: this.newUniverse.is_public,
      created_by: created_by,
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
        console.log("Nouvel univers créé :", response.data);
        this.loadUniverses();
      },
      error: (err) => console.error("Erreur dans le service:", err),
    });
    this.newUniverse = { name: "", description: "", is_public: true };
  }

  deleteUniverse(id: number): void {
    this.queryService.deleteUniverse(id).subscribe({
      next: (response) => {
        if (response.error) {
          console.error(
            "Erreur lors de la suppression de l'univers :",
            response.error,
          );
          return;
        }
        console.log("Univers supprimé :", response.data);
        this.loadUniverses();
      },
      error: (err) => console.error("Erreur dans le service:", err),
    });
  }

  // Getter pour récupérer l'univers sélectionné depuis le service d'état
  get selectedUniverse() {
    return this.stateService.currentState().selectedUniverse;
  }

  // Filtrer les univers créés par Mirojo (UUID fourni)
  get mirojoUniverses() {
    return this.universes.filter(
      (u) => u.created_by === "d57e74dd-a15b-4e99-b59a-b679c2c5d0ed",
    );
  }

  // Filtrer les univers créés par l'utilisateur connecté
  get userUniverses() {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return [];
    return this.universes.filter((u) => u.created_by === currentUser.id);
  }

  // Filtrer tous les univers publics
  get publicUniverses() {
    return this.universes.filter((u) => u.is_public === true);
  }
}
