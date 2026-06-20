import { createClient } from "@/lib/supabase/server";
import { DocumentsLayoutClient } from "../DocumentsLayoutClient";
import { DatasetsPageClient } from "@/components/datasets/DatasetsPageClient";
import type { Dataset, Document } from "@/types/database";

export default async function DatasetsPage() {
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
      <DatasetsPageClient />
    </DocumentsLayoutClient>
  );
}
