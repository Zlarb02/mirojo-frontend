import { Injectable, signal } from "@angular/core";

export interface GameCreationState {
  selectedUniverse?: any;
  // Ajoutez ici d'autres propriétés pour suivre l'état de la création de partie
}

@Injectable({
  providedIn: "root",
})
export class GameStateService {
  // Vous pouvez utiliser les signals, BehaviorSubject ou tout autre mécanisme réactif
  currentState = signal<GameCreationState>({});

  constructor() {}

  setSelectedUniverse(universe: any): void {
    this.currentState.set({
      ...this.currentState(),
      selectedUniverse: universe,
    });
  }

  // Ajoutez d'autres méthodes pour gérer l'état (mise à jour d'options, progression, etc.)
}
