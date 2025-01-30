import { Injectable, signal, computed } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
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
  private _session = signal<AuthSession | null>(null);

  constructor() {
    this.supabase = createClient(
      'https://supasupa.mirojo.app',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzM3OTMyNDAwLAogICJleHAiOiAxODk1Njk4ODAwCn0.gleKpCo88nbAdYoByc5MjDpmoQa_mCrUZplMsnHWQT8',
      { auth: { persistSession: true, autoRefreshToken: true } } // ✅ Sauvegarde la session dans localStorage
    );

    this.initializeAuth();
  }

  private async initializeAuth() {
    console.log('🔄 Vérification de la session existante...');
    const { data } = await this.supabase.auth.getSession();
    console.log('🔍 Session trouvée au démarrage:', data.session);
    this._session.set(data.session);

    // ✅ Écoute les changements d'authentification
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log(`🔄 Auth state changed: ${event}`);
      this._session.set(session);
    });
  }

  // 🔹 Getter pour récupérer la session actuelle
  get session() {
    return this._session();
  }

  // 🔹 `computed()` pour savoir si l'utilisateur est connecté
  isLoggedIn = computed(() => !!this.session);

  // 🔹 Connexion par email et mot de passe
  async signInWithPassword(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  // 🔹 Connexion avec lien magique
  async signInWithMagicLink(email: string) {
    return this.supabase.auth.signInWithOtp({ email });
  }

  // 🔹 Connexion avec OAuth (Google, GitHub, etc.)
  async signInWithOAuth(provider: 'google' | 'github' | 'facebook') {
    return this.supabase.auth.signInWithOAuth({ provider });
  }

  // 🔹 Inscription avec email et mot de passe
  async signUp(email: string, password: string) {
    return this.supabase.auth.signUp({
      email,
      password,
    });
  }

  // 🔹 Déconnexion
  async signOut() {
    await this.supabase.auth.signOut();
    this._session.set(null);
  }

  // 🔹 Mise à jour du profil utilisateur
  updateProfile(profile: Profile) {
    const update = {
      ...profile,
      updated_at: new Date(),
    };

    return this.supabase.from('profiles').upsert(update);
  }

  // 🔹 Gestion des avatars
  downLoadImage(path: string) {
    return this.supabase.storage.from('avatars').download(path);
  }

  uploadAvatar(filePath: string, file: File) {
    return this.supabase.storage.from('avatars').upload(filePath, file);
  }
}
