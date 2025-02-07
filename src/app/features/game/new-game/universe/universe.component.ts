import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { GameStateService } from "../../../../core/services/game-state.service";
import { UniverseDetailsComponent } from "./universe-details/universe-details.component";

@Component({
  selector: "app-universe",
  standalone: true,
  imports: [RouterOutlet, CommonModule, UniverseDetailsComponent],
  templateUrl: "./universe.component.html",
  styleUrl: "./universe.component.scss",
})
export class UniverseComponent {}
