import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentsLayoutClient, EmptyDocumentState } from "./DocumentsLayoutClient";
import type { Document } from "@/types/database";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .order("updated_at", { ascending: false });

  const docs = (documents ?? []) as Document[];

  if (docs.length > 0) {
    redirect(`/documents/${docs[0].id}`);
  }

  return (
    <DocumentsLayoutClient initialDocuments={docs}>
      <EmptyDocumentState />
    </DocumentsLayoutClient>
  );
}
