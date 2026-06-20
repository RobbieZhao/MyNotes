import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentEditorProvider } from "@/contexts/DocumentEditorContext";
import { DocumentRuntimeProvider } from "@/contexts/DocumentRuntimeContext";
import { DocumentEditor } from "@/components/editor/DocumentEditor";
import { DocumentsLayoutClient } from "../DocumentsLayoutClient";
import type { BlockRow, BlockGroup, Dataset, Document } from "@/types/database";

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: document }, { data: allDocuments }, { data: blocks }, { data: blockGroups }, { data: datasets }] =
    await Promise.all([
      supabase.from("documents").select("*").eq("id", id).single(),
      supabase.from("documents").select("*").order("updated_at", { ascending: false }),
      supabase.from("blocks").select("*").eq("document_id", id).order("position"),
      supabase.from("block_groups").select("*").eq("document_id", id).order("position"),
      supabase.from("datasets").select("*").order("updated_at", { ascending: false }),
    ]);

  if (!document) {
    notFound();
  }

  return (
    <DocumentsLayoutClient
      initialDocuments={(allDocuments ?? []) as Document[]}
      initialDatasets={(datasets ?? []) as Dataset[]}
    >
      <DocumentRuntimeProvider>
        <DocumentEditorProvider
          document={document as Document}
          initialBlocks={(blocks ?? []) as BlockRow[]}
          initialBlockGroups={(blockGroups ?? []) as BlockGroup[]}
        >
          <DocumentEditor />
        </DocumentEditorProvider>
      </DocumentRuntimeProvider>
    </DocumentsLayoutClient>
  );
}
