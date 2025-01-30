import { Component, computed, OnInit } from '@angular/core';
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

  constructor(
    private readonly router: Router,
    private readonly supabase: SupabaseService
  ) {}

  // 🔹 `computed()` permet de toujours avoir la dernière session
  session = computed(() => this.supabase.session);
  isLoggedIn = computed(() => !!this.supabase.session);

  ngOnInit() {
    console.log('🔄 AppComponent chargé.');

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log('🔄 Navigation détectée vers :', event.url);
      }
    });
  }
}
