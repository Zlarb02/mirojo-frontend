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
      useFactory: (supabase: SupabaseService, router: Router) => {
        return () => {
          console.log('🔄 Vérification de la session au chargement...');
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
      deps: [SupabaseService, Router],
      multi: true,
    },
  ],
};
