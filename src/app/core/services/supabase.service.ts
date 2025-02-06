// src/app/core/services/supabase.service.ts
import { Injectable } from "@angular/core";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable({
  providedIn: "root",
})
export class SupabaseService {
  public client: SupabaseClient = createClient(
    "https://supasupa.mirojo.app",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzM3OTMyNDAwLAogICJleHAiOiAxODk1Njk4ODAwCn0.gleKpCo88nbAdYoByc5MjDpmoQa_mCrUZplMsnHWQT8",
  );
}
