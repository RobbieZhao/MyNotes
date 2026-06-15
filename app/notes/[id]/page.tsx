import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NoteEditor from "@/components/editor/NoteEditor";
import type { Note } from "@/lib/types";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!note) {
    notFound();
  }

  const typedNote = note as Note;

  return (
    <NoteEditor
      noteId={typedNote.id}
      initialTitle={typedNote.title}
      initialContent={typedNote.content}
    />
  );
}
