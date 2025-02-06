import { Injectable, inject } from "@angular/core";
import { from, Observable } from "rxjs";
import { PostgrestResponse } from "@supabase/supabase-js";
import { SupabaseService } from "./supabase.service";

@Injectable({
  providedIn: "root",
})
export class GameQueryService {
  private supabaseService = inject(SupabaseService);
  private supabase = this.supabaseService.client;

  getUniverses(): Observable<PostgrestResponse<any>> {
    const promise = this.supabase.from("universes").select("*");
    return from(promise);
  }

  createUniverse(newUniverse: {
    name: string;
    description: string;
    is_public: boolean;
    created_by?: string;
  }): Observable<any> {
    const promise = this.supabase.from("universes").insert([newUniverse]);
    return from(promise);
  }

  deleteUniverse(id: number): Observable<any> {
    const promise = this.supabase.from("universes").delete().eq("id", id);
    return from(promise);
  }
}
