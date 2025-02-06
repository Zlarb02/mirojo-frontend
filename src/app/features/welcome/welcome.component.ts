import { Component } from "@angular/core";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { NavComponent } from "../../shared/components/nav/nav.component";

@Component({
  selector: "app-welcome",
  standalone: true,
  imports: [FooterComponent, NavComponent],
  templateUrl: "./welcome.component.html",
  styleUrl: "./welcome.component.scss",
})
export class WelcomeComponent {}
