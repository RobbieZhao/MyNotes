import { createClient } from "@/lib/supabase/server";
import { DocumentsLayoutClient } from "../documents/DocumentsLayoutClient";
import type { Dataset, Document } from "@/types/database";

export default async function DatasetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const [{ data: documents }, { data: datasets }] = await Promise.all([
    supabase.from("documents").select("*").order("updated_at", { ascending: false }),
    supabase.from("datasets").select("*").order("updated_at", { ascending: false }),
  ]);

  return (
    <DocumentsLayoutClient
      initialDocuments={(documents ?? []) as Document[]}
      initialDatasets={(datasets ?? []) as Dataset[]}
    >
      {children}
    </DocumentsLayoutClient>
  );
}
