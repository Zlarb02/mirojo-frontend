import { Injectable } from "@angular/core";
import {
  createClient,
  SupabaseClient,
  AuthChangeEvent,
  Session,
} from "@supabase/supabase-js";

const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private supabase: SupabaseClient;
  constructor() {
    this.supabase = createClient(
      `https://supasupa.mirojo.app`,
      `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzM3OTMyNDAwLAogICJleHAiOiAxODk1Njk4ODAwCn0.gleKpCo88nbAdYoByc5MjDpmoQa_mCrUZplMsnHWQT8`,
    );
  }

  // async signInWithGoogle() {
  //   const { error } = await this.supabase.auth.signInWithOAuth({
  //     provider: "google",
  //     options: { redirectTo: window.location.origin },
  //   });
  //   if (error) {
  //     console.error("Google Sign-In Error:", error.message);
  //   }
  // }

  // async loginWithEmail(email: string, password: string) {
  //   const { error } = await this.supabase.auth.signInWithPassword({
  //     email,
  //     password,
  //   });
  //   if (error) {
  //     console.error("Email Login Error:", error.message);
  //   }
  // }

  // async signOut() {
  //   const { error } = await this.supabase.auth.signOut();
  //   if (error) {
  //     console.error("Sign Out Error:", error.message);
  //   }
  // }
}
