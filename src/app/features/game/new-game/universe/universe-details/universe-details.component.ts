import { Component, inject, OnInit } from "@angular/core";
import { NavComponent } from "../../../../../shared/components/nav/nav.component";
import { ActivatedRoute, Router } from "@angular/router";
import { GameStateService } from "../../../../../core/services/game-state.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-universe-details",
  standalone: true,
  imports: [NavComponent, CommonModule],
  templateUrl: "./universe-details.component.html",
  styleUrl: "./universe-details.component.scss",
})
export class UniverseDetailsComponent implements OnInit {
  selectedUniverse: any | null = null;
  universeId: string | null = null;
  gameState = inject(GameStateService);
  router = inject(Router);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.selectedUniverse = this.gameState.currentState().selectedUniverse;
    this.universeId = this.route.snapshot.paramMap.get("id");
    if (!this.selectedUniverse || this.selectedUniverse.id != this.universeId) {
      console.warn(
        "You con only access the selected universe for start new game in new-game/universe/id",
      );
      this.router.navigate(["/error"]); // Redirection vers une page d'erreur
    }
  }
}
