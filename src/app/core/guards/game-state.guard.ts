import { inject } from "@angular/core";
import { CanActivateFn, ActivatedRouteSnapshot, Router } from "@angular/router";
import { GameStateService } from "../services/game-state.service";

export const gameStateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
) => {
  const gameState = inject(GameStateService);
  const router = inject(Router);

  const universeId = route.params["id"]; // ✅ Accéder à l'ID correctement
  const selectedUniverse = gameState.currentState().selectedUniverse;

  if (!selectedUniverse || selectedUniverse.id !== universeId) {
    console.warn("Access denied: Invalid universe selection.");
    router.navigate(["/error"]);
    return false;
  }

  return true;
};
