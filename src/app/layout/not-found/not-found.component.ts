import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { NavComponent } from "../../shared/components/nav/nav.component";

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [NavComponent],
  templateUrl: "./not-found.component.html",
  styleUrl: "./not-found.component.scss",
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(["/"]); // Redirection vers la page d'accueil
  }
}
