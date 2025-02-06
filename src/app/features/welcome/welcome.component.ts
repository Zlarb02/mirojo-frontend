import { Component } from "@angular/core";
import { FooterComponent } from "../../layout/footer/footer.component";
import { NavComponent } from "../../layout/nav/nav.component";

@Component({
  selector: "app-welcome",
  standalone: true,
  imports: [FooterComponent, NavComponent],
  templateUrl: "./welcome.component.html",
  styleUrl: "./welcome.component.scss",
})
export class WelcomeComponent {}
