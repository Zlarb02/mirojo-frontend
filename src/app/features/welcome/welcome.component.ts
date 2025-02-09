import { Component } from '@angular/core';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { VisibilityToggleDirective } from '../../shared/directives/ui/visibility-toggle.directive';
import { DiceComponent } from '../../shared/components/dice/dice.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [NavComponent, VisibilityToggleDirective, DiceComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent {}
