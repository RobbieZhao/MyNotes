import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import type { SaveStatus } from "@/lib/types";

export function useAutoSave(
  noteId: string,
  title: string,
  content: string,
  debouncedTitle: string,
  debouncedContent: string
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    let cancelled = false;

    async function save() {
      setSaveStatus("saving");
      const supabase = createClient();
      const slug = slugify(debouncedTitle);

      const { error } = await supabase
        .from("notes")
        .update({ title: debouncedTitle, content: debouncedContent, slug })
        .eq("id", noteId);

      if (cancelled) return;

      if (error) {
        // Retry with suffix on slug conflict
        if (error.code === "23505") {
          const suffix = Date.now().toString(36).slice(-4);
          const { error: retryError } = await supabase
            .from("notes")
            .update({
              title: debouncedTitle,
              content: debouncedContent,
              slug: `${slug}-${suffix}`,
            })
            .eq("id", noteId);

          if (cancelled) return;
          setSaveStatus(retryError ? "error" : "saved");
        } else {
          setSaveStatus("error");
        }
      } else {
        setSaveStatus("saved");
      }
    }

    save();

    return () => {
      cancelled = true;
    };
  }, [noteId, debouncedTitle, debouncedContent]);

  // Reset saved indicator when user types again
  useEffect(() => {
    if (
      title !== debouncedTitle ||
      content !== debouncedContent
    ) {
      if (saveStatus === "saved") {
        setSaveStatus("idle");
      }
    }
  }, [title, content, debouncedTitle, debouncedContent, saveStatus]);

  return saveStatus;
}
