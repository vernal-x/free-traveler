import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

/** `supabase/migrations/0001_core_schema.sql`의 external_link_settings 테이블과 1:1 대응. */
export interface ExternalLinkSettingRow {
  id: string;
  key: "FLIGHT_OUTBOUND_URL" | "HOTEL_OUTBOUND_URL";
  url: string;
  updated_by: string | null;
  updated_at: string;
}

const upsertExternalLinkSettingSchema = z.object({
  key: z.enum(["FLIGHT_OUTBOUND_URL", "HOTEL_OUTBOUND_URL"]),
  url: z.string().url().startsWith("https://"),
  updatedBy: z.string().uuid().optional(),
});

export type UpsertExternalLinkSettingInput = z.infer<
  typeof upsertExternalLinkSettingSchema
>;

export async function getExternalLinkSetting(
  client: SupabaseClient,
  key: ExternalLinkSettingRow["key"],
): Promise<ExternalLinkSettingRow | null> {
  const { data, error } = await client
    .from("external_link_settings")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** REQ-FUNC-024: HTTPS 허용목록만 저장(Admin 권한 검증은 RLS·호출측 책임). */
export async function upsertExternalLinkSetting(
  client: SupabaseClient,
  input: UpsertExternalLinkSettingInput,
): Promise<ExternalLinkSettingRow> {
  const parsed = upsertExternalLinkSettingSchema.parse(input);

  const { data, error } = await client
    .from("external_link_settings")
    .upsert(
      {
        key: parsed.key,
        url: parsed.url,
        updated_by: parsed.updatedBy ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
