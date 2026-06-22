import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import { createClient } from "@/lib/supabase/server";
import { DatasetDetailClient } from "@/components/datasets/DatasetDetailClient";
import type { Dataset } from "@/types/database";

interface DatasetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DatasetDetailPage({ params }: DatasetDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.from("datasets").select("*").eq("id", id).maybeSingle();

  if (error || !data) {
    notFound();
  }

  return (
    <Box sx={{ height: "100%", minHeight: 0, overflow: "auto" }}>
      <DatasetDetailClient dataset={data as Dataset} />
    </Box>
  );
}
