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
      { auth: { persistSession: true, autoRefreshToken: true } }
    );

    this.initializeAuth();
  }

  private async initializeAuth() {
    console.log('🔄 Vérification de la session existante...');
    const { data, error } = await this.supabase.auth.getSession();
    if (error) {
      console.error('❌ Erreur lors de la récupération de la session :', error);
    } else {
      console.log('🔍 Session trouvée au démarrage:', data.session);
      this._session.set(data.session);
    }

    this.supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: AuthSession | null) => {
        console.log(`🔄 Auth state changed: ${event}`);
        this._session.set(session);
      }
    );
  }

  get session() {
    return this._session();
  }

  isLoggedIn = computed(() => !!this.session);

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signInWithMagicLink(email: string) {
    const { error } = await this.supabase.auth.signInWithOtp({ email });
    return { error };
  }

  async signInWithOAuth(provider: 'google' | 'github' | 'facebook') {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
    });
    return { data, error };
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (!error) this._session.set(null);
    return { error };
  }

  async profile(user: User) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select(`username, website, avatar_url`)
      .eq('id', user.id)
      .single();

    return { data, error };
  }

  async updateProfile(profile: Profile) {
    const update = { ...profile, updated_at: new Date() };
    const { data, error } = await this.supabase.from('profiles').upsert(update);
    return { data, error };
  }

  async downLoadImage(path: string) {
    const { data, error } = await this.supabase.storage
      .from('avatars')
      .download(path);
    return { data, error };
  }

  async uploadAvatar(filePath: string, file: File) {
    const { data, error } = await this.supabase.storage
      .from('avatars')
      .upload(filePath, file);
    return { data, error };
  }
}
