import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { SupabaseService } from './services/supabase.service';

console.log('🔍 app.config.ts chargé !');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    {
      provide: 'APP_INITIALIZER',
      useFactory: () => {
        return async () => {
          console.log('🔄 Début de APP_INITIALIZER...');
          const supabase = inject(SupabaseService);
          const router = inject(Router);

          console.log(
            "🔄 Attente de l'initialisation de l'authentification..."
          );
          await new Promise((resolve) => setTimeout(resolve, 500)); // ✅ Attendre 500ms avant de router
          await supabase.waitForAuthInit();

          console.log(
            '🔄 Authentification initialisée. Vérification de la session...'
          );
          if (supabase.session) {
            console.log('✅ Utilisateur connecté. Redirection vers /profile');
            router.navigate(['/profile']);
          } else {
            console.log(
              '🔄 Aucun utilisateur connecté. Redirection vers /welcome'
            );
            router.navigate(['/welcome']);
          }
        };
      },
      multi: true,
    },
  ],
};
