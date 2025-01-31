import { Injectable, signal } from '@angular/core';
import { AuthResponse, createClient } from '@supabase/supabase-js';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  supabase = createClient(
    'https://supasupa.mirojo.app',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzM3OTMyNDAwLAogICJleHAiOiAxODk1Njk4ODAwCn0.gleKpCo88nbAdYoByc5MjDpmoQa_mCrUZplMsnHWQT8'
  );

  currentUser = signal<{ email: string; username: string } | null>(null);

  constructor() {
    this.listenToAuthChanges();
  }

  private listenToAuthChanges() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.currentUser.set({
          email: session.user.email!,
          username: session.user.user_metadata['username'] || '',
        });
      } else {
        this.currentUser.set(null);
      }
    });

    // Charger la session initiale (évite le problème au rechargement de la page)
    this.supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        this.currentUser.set({
          email: data.session.user.email!,
          username: data.session.user.user_metadata['username'] || '',
        });
      }
    });
  }

  register(
    email: string,
    username: string,
    password: string
  ): Observable<AuthResponse> {
    const promise = this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });
    return from(promise);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const promise = this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return from(promise);
  }

  logout(): Promise<void> {
    return this.supabase.auth.signOut().then(() => {
      this.currentUser.set(null); // Mettre à jour le signal immédiatement
    });
  }
}
