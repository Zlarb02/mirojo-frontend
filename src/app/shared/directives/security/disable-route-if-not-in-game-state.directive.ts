import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
} from "@angular/core";
import { Router } from "@angular/router";
import { GameStateService } from "../../../core/services/game-state.service";

@Directive({
  selector: "[appCheckGameState]",
  standalone: true, // ✅ Directive réutilisable sans NgModule
})
export class CheckGameStateDirective {
  private gameState = inject(GameStateService);
  private router = inject(Router);

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
  ) {}

  @Input() set appCheckGameState(universeId: string | null) {
    const selectedUniverse = this.gameState.currentState().selectedUniverse;

    if (selectedUniverse && selectedUniverse.id === universeId) {
      this.viewContainer.createEmbeddedView(this.templateRef); // ✅ Afficher le contenu
    } else {
      this.viewContainer.clear(); // ❌ Cacher le contenu
      console.warn(
        "You can only access the selected universe for starting a new game in new-game/universe/id",
      );
      this.router.navigate(["/error"]); // 🚨 Redirection si accès refusé
    }
  }
}
