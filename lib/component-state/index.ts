import { createClient } from "@/lib/supabase/client";
import type { ComponentStateRow } from "./types";

export async function getComponentState<T extends Record<string, unknown>>(
  noteId: string,
  componentKey: string
): Promise<T | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("component_states")
    .select("data")
    .eq("note_id", noteId)
    .eq("component_key", componentKey)
    .maybeSingle();

  if (error) {
    console.error("Failed to load component state:", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  return data.data as T;
}

export async function saveComponentState<T extends Record<string, unknown>>(
  noteId: string,
  componentKey: string,
  componentType: string,
  data: T
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.from("component_states").upsert(
    {
      note_id: noteId,
      component_key: componentKey,
      component_type: componentType,
      data,
    },
    { onConflict: "note_id,component_key" }
  );

  if (error) {
    console.error("Failed to save component state:", error.message);
    return { error: error.message };
  }

  return { error: null };
}

export type { ComponentStateRow };
