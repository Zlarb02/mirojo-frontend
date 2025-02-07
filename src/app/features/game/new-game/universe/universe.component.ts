import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-universe',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './universe.component.html',
  styleUrl: './universe.component.scss',
})
export class UniverseComponent implements OnInit {
  @Input() selectedUniverse: any | null = null;
  universeId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Récupère le paramètre d'URL nommé "id"
    this.universeId = this.route.snapshot.paramMap.get('id');
    // Vous pouvez utiliser "universeId" pour charger des données spécifiques, etc.
    console.log("ID de l'univers :", this.universeId);
  }
}
