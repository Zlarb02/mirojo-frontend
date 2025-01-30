import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { SupabaseService } from './services/supabase.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    {
      provide: 'APP_INITIALIZER',
      useFactory: () => {
        return async () => {
          // ✅ Ajout de async pour permettre await
          const supabase = inject(SupabaseService);
          const router = inject(Router);

          console.log(
            "🔄 Attente de l'initialisation de l'authentification..."
          );

          await supabase.waitForAuthInit(); // ✅ Attendre que l'auth soit prête

          console.log(
            '🔄 Authentification initialisée. Vérification de la session...'
          );
          if (supabase.session) {
            console.log('✅ Utilisateur connecté. Redirection vers /profile');
            router.navigate(['/profile']); // ✅ Redirige si l'utilisateur est connecté
          } else {
            console.log(
              '🔄 Aucun utilisateur connecté. Redirection vers /welcome'
            );
            await new Promise((resolve) => setTimeout(resolve, 5000)); // ✅ Attendre 500ms
            router.navigate(['/welcome']);
          }
        };
      },
      multi: true,
    },
  ],
};
