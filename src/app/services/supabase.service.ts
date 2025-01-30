import { Injectable, signal } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';

interface Profile {
  id?: string;
  username?: string;
  website?: string;
  avatar_url?: string;
  updated_at?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _session = signal<AuthSession | null>(null); // Signal pour suivre la session
  public isAuthInitialized = false; // Indique si l'auth est prête

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

    // Charger la session après l'authentification
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

    this.isAuthInitialized = true; // ✅ Indiquer que l'authentification est prête
    console.log('✅ Authentification prête !');
  }

  private async checkForMagicLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      console.log('🔄 Échange du code pour une session...');
      const { error } = await this.supabase.auth.exchangeCodeForSession(
        window.location.href
      );
      if (!error) {
        console.log('✅ Connexion via lien magique réussie.');

        // Charger la session après l'échange du code
        const { data } = await this.supabase.auth.getSession();
        this._session.set(data.session);

        // Nettoyer l'URL pour éviter un rechargement infini après échange du code
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } else {
        console.error(
          '⚠️ Erreur lors de la récupération de la session :',
          error.message
        );
      }
    } else {
      console.log("⚠️ Aucun code de connexion trouvé dans l'URL.");
    }
  }

  async waitForAuthInit(): Promise<void> {
    while (!this.isAuthInitialized) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  get session() {
    if (!this.isAuthInitialized) {
      console.warn(
        "⚠️ La session est demandée avant l'initialisation de l'auth !"
      );
      return null;
    }
    return this._session();
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

  // ✅ Connexion avec OTP (Email Magic Link)
  signIn(email: string) {
    return this.supabase.auth.signInWithOtp({ email });
  }

  // ✅ Connexion avec un fournisseur OAuth (Google, GitHub, etc.)
  async signInWithOAuth(provider: 'google' | 'github' | 'facebook') {
    return this.supabase.auth.signInWithOAuth({ provider });
  }

  // ✅ Connexion avec Email et Mot de passe
  async signInWithPassword(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this._session.set(null); // Met à jour l'état après la déconnexion
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
