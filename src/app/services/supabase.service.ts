import { Injectable, signal } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';

export interface Profile {
  id?: string;
  username: string;
  website: string;
  avatar_url: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _session = signal<AuthSession | null>(null); // Signal pour suivre la session

  constructor() {
    this.supabase = createClient(
      'https://supasupa.mirojo.app',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzM3OTMyNDAwLAogICJleHAiOiAxODk1Njk4ODAwCn0.gleKpCo88nbAdYoByc5MjDpmoQa_mCrUZplMsnHWQT8'
    );

    this.initializeAuth();
  }

  private async initializeAuth() {
    console.log("🔄 Initialisation de l'authentification...");

    // Vérifier si on arrive d'un lien magique
    await this.checkForMagicLink();

    // Charger la session depuis Supabase
    const { data } = await this.supabase.auth.getSession();
    this._session.set(data.session);

    // Écouter les changements d'état d'authentification
    this.supabase.auth.onAuthStateChange((event, session) => {
      this._session.set(session);

      if (event === 'SIGNED_IN') {
        console.log('✅ Utilisateur connecté.');
      } else if (event === 'SIGNED_OUT') {
        console.log('❌ Utilisateur déconnecté.');
      }
    });
  }

  private async checkForMagicLink() {
    const { error } = await this.supabase.auth.exchangeCodeForSession(
      window.location.href
    );
    if (!error) {
      console.log('✅ Connexion via lien magique réussie.');

      // Charger la session après l'échange du code
      const { data } = await this.supabase.auth.getSession();
      this._session.set(data.session);
    } else {
      console.error(
        '⚠️ Erreur lors de la récupération de la session :',
        error.message
      );
    }
  }

  get session() {
    return this._session(); // Utilisation du signal pour éviter les problèmes de synchro
  }

  profile(user: User) {
    return this.supabase
      .from('profiles')
      .select(`username, website, avatar_url`)
      .eq('id', user.id)
      .single();
  }

  authChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // Connexion avec OTP (Email Magic Link)
  signIn(email: string) {
    return this.supabase.auth.signInWithOtp({ email });
  }

  // Connexion avec un fournisseur OAuth (Google, GitHub, etc.)
  async signInWithOAuth(provider: 'google' | 'github' | 'facebook') {
    return this.supabase.auth.signInWithOAuth({
      provider,
    });
  }

  // Connexion avec Email et Mot de passe
  async signInWithPassword(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this._session.set(null); // Assurer la mise à jour du signal après déconnexion
  }

  updateProfile(profile: Profile) {
    const update = {
      ...profile,
      updated_at: new Date(),
    };

    return this.supabase.from('profiles').upsert(update);
  }

  downLoadImage(path: string) {
    return this.supabase.storage.from('avatars').download(path);
  }

  uploadAvatar(filePath: string, file: File) {
    return this.supabase.storage.from('avatars').upload(filePath, file);
  }
}
