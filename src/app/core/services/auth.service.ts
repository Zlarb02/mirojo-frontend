import { inject, Injectable, signal } from "@angular/core";

import { SupabaseService } from "./supabase.service";
import {
  AuthResponse,
  createClient,
  UserResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { Observable, from, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  // Utilisation de l'instance partagée
  supabase = this.supabaseService.client;

  currentUser = signal<{
    id: string;
    email: string;
    username: string;
    full_name: string;
    avatar_url: string;
    website: string;
  } | null>(null);

  constructor() {
    this.listenToAuthChanges();
  }

  private listenToAuthChanges() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.loadUserProfile(session.user.id, session.user.email!);
      } else {
        this.currentUser.set(null);
      }
    });

    this.supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        this.loadUserProfile(data.session.user.id, data.session.user.email!);
      }
    });
  }

  private loadUserProfile(userId: string, email: string) {
    this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId) // On utilise l'id au lieu de l'email
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Erreur de récupération du profil :", error);
          return;
        }
        if (data) {
          this.currentUser.set({
            id: userId,
            email,
            username: data.username || "",
            full_name: data.full_name || "",
            avatar_url: data.avatar_url || "",
            website: data.website || "",
          });
        }
      });
  }

  register(
    email: string,
    username: string,
    password: string,
  ): Observable<AuthResponse> {
    const promise = this.supabase.auth
      .signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      })
      .then(async ({ data, error }) => {
        if (error) throw error;
        if (data.user) {
          // Ajouter le profil utilisateur dans la table `profiles`
          await this.supabase.from("profiles").insert({
            id: data.user.id, // On utilise l'ID du user
            username,
            full_name: "",
            avatar_url: "",
            website: "",
          });
        }
        return { data, error };
      });

    return from(promise);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const promise = this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    return from(promise).pipe(
      tap(({ data }) => {
        if (data.session?.user) {
          this.loadUserProfile(data.session.user.id, data.session.user.email!);
        }
      }),
    );
  }

  logout(): Promise<void> {
    return this.supabase.auth.signOut().then(() => {
      this.currentUser.set(null);
    });
  }

  private updateProfileData(
    updateData: object,
  ): Observable<PostgrestSingleResponse<any>> {
    return from(
      this.supabase
        .from("profiles")
        .update(updateData)
        .eq("id", this.currentUser()?.id), // On utilise id au lieu de email
    ).pipe(
      tap(({ error }) => {
        if (error) throw error;
        this.currentUser.set({ ...this.currentUser()!, ...updateData });
      }),
    );
  }

  updateUsername(
    newUsername: string,
  ): Observable<PostgrestSingleResponse<any>> {
    return this.updateProfileData({ username: newUsername });
  }

  updateFullName(
    newFullName: string,
  ): Observable<PostgrestSingleResponse<any>> {
    return this.updateProfileData({ full_name: newFullName });
  }

  updateAvatarUrl(
    newAvatarUrl: string,
  ): Observable<PostgrestSingleResponse<any>> {
    return this.updateProfileData({ avatar_url: newAvatarUrl });
  }

  updateWebsite(newWebsite: string): Observable<PostgrestSingleResponse<any>> {
    return this.updateProfileData({ website: newWebsite });
  }
}
