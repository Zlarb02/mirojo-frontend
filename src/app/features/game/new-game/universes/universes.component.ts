import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  Signal,
  signal,
  SimpleChanges,
} from '@angular/core';
import { NavComponent } from '../../../../shared/components/nav/nav.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DisableIfNotOwnerDirective } from '../../../../shared/directives/security/disable-if-not-owner.directive';
import { CommonModule } from '@angular/common';
import { VisibilityToggleDirective } from '../../../../shared/directives/ui/visibility-toggle.directive';

@Component({
  selector: 'app-universes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavComponent,
    DisableIfNotOwnerDirective,
    VisibilityToggleDirective,
  ],
  templateUrl: './universes.component.html',
  styleUrl: './universes.component.scss',
})
export class UniversesComponent {
  @Input() selectedUniverse: any | null = null;
  @Input() newUniverse: any = { name: '', description: '', is_public: false };

  @Input() loadMirojoUniverses!: () => void;
  @Input() loadUserUniverses!: () => void;
  @Input() loadPublicUniverses!: () => void;

  @Input() mirojoUniverses: Signal<any[]> = signal([]);
  @Input() userUniverses: Signal<any[]> = signal([]);
  @Input() publicUniverses: Signal<any[]> = signal([]);

  @Output() selectUniverse = new EventEmitter<any>();
  @Output() deselectUniverse = new EventEmitter<void>();
  @Output() createUniverse = new EventEmitter<any>();
  @Output() deleteUniverse = new EventEmitter<number>();

  toggleMirojo() {
    this.loadMirojoUniverses();
  }

  toggleUser() {
    this.loadUserUniverses();
  }

  togglePublic() {
    this.loadPublicUniverses();
  }
}
