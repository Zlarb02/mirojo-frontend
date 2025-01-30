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
        return () => {
          const supabase = inject(SupabaseService);
          const router = inject(Router);
          if (supabase.session) {
            router.navigate(['/profile']); //  Redirige si l'utilisateur est connecté
          }
        };
      },
      multi: true,
    },
  ],
};
