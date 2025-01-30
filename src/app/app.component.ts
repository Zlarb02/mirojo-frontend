import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'MirojoFrontend';

  session = this.supabase.session;

  constructor(
    private readonly router: Router,
    private readonly supabase: SupabaseService // ✅ Injection du service Supabase
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log(`⏳ Attente avant la redirection vers ${event.url}...`);

        // ⏳ Bloquer la navigation pendant 5 secondes avant de continuer
        setTimeout(() => {
          console.log(`✅ Redirection appliquée : ${event.url}`);
        }, 5000);
      }
    });
  }

  ngOnInit() {
    this.supabase.authChanges((_, session) => (this.session = session));
  }
}
