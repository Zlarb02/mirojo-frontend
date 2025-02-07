import { Injectable, signal } from "@angular/core";

export interface GameState {
  isStarted: boolean;
  selectedUniverse?: any;
  allEnemies?: any[]; // Stocke un tableau d'ennemis
}

@Injectable({
  providedIn: "root",
})
export class GameStateService {
  // Signal pour stocker l'état du jeu
  currentState = signal<GameState>({ isStarted: false });

  constructor() {}

  // Définir l'univers sélectionné
  setSelectedUniverse(universe: any): void {
    this.currentState.set({
      ...this.currentState(),
      selectedUniverse: universe,
    });
  }

  // Ajouter ou mettre à jour la liste des ennemis
  setEnemies(enemies: any[]): void {
    this.currentState.set({
      ...this.currentState(),
      allEnemies: enemies,
    });
  }

  // Ajouter un ennemi à la liste existante
  addEnemy(enemy: any): void {
    this.currentState.set({
      ...this.currentState(),
      allEnemies: [...(this.currentState().allEnemies || []), enemy],
    });
  }

  // Supprimer un ennemi par ID
  removeEnemy(enemyId: any): void {
    this.currentState.set({
      ...this.currentState(),
      allEnemies:
        this.currentState().allEnemies?.filter((e) => e.id !== enemyId) || [],
    });
  }
}
