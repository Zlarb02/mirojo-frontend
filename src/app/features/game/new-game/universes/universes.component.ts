import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  Signal,
  signal,
  SimpleChanges,
  WritableSignal,
} from "@angular/core";
import { NavComponent } from "../../../../shared/components/nav/nav.component";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { DisableIfNotOwnerDirective } from "../../../../shared/directives/security/disable-if-not-owner.directive";
import { CommonModule } from "@angular/common";
import { VisibilityToggleDirective } from "../../../../shared/directives/ui/visibility-toggle.directive";

@Component({
  selector: "app-universes",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavComponent,
    DisableIfNotOwnerDirective,
    VisibilityToggleDirective,
  ],
  templateUrl: "./universes.component.html",
  styleUrl: "./universes.component.scss",
})
export class UniversesComponent {
  @Input() selectedUniverse: any | null = null;
  @Input() newUniverse: WritableSignal<{
    name: string;
    description: string;
    is_public: boolean;
  }> = signal({ name: "", description: "", is_public: false });

  @Input() loadMirojoUniverses!: () => void;
  @Input() loadUserUniverses!: () => void;
  @Input() loadPublicUniverses!: () => void;

  @Input() mirojoUniverses: Signal<any[]> = signal([]);
  @Input() userUniverses: Signal<any[]> = signal([]);
  @Input() publicUniverses: Signal<any[]> = signal([]);

  @Output() selectUniverseEvent = new EventEmitter<any>();
  @Output() deselectUniverseEvent = new EventEmitter<void>();
  @Output() createUniverseEvent = new EventEmitter<void>();
  @Output() deleteUniverseEvent = new EventEmitter<any>();

  // Méthodes qui déclenchent l'émission des événements
  onSelect(universe: any): void {
    this.selectUniverseEvent.emit(universe);
    console.log(universe.name + " emit");
  }

  onDeselect(): void {
    this.deselectUniverseEvent.emit();
  }

  // Exemple d'une méthode pour mettre à jour le nom
  onNameChange(newName: string): void {
    this.newUniverse.set({
      ...this.newUniverse(),
      name: newName,
    });
  }

  // Méthode pour mettre à jour la description directement dans le template
  onDescriptionChange(newDescription: string): void {
    this.newUniverse.set({
      ...this.newUniverse(),
      description: newDescription,
    });
  }

  // Pour la checkbox, vous pouvez faire de même
  onPublicChange(isPublic: boolean): void {
    this.newUniverse.set({
      ...this.newUniverse(),
      is_public: isPublic,
    });
  }
  onCreate(): void {
    this.createUniverseEvent.emit();
  }

  onDelete(id: any): void {
    this.deleteUniverseEvent.emit(id);
  }

  toggleMirojo() {
    this.loadMirojoUniverses;
  }

  toggleUser() {
    this.loadUserUniverses;
  }

  togglePublic() {
    this.loadPublicUniverses;
  }
}
