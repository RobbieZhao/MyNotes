import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/sidebar/Sidebar";
import type { NoteSummary } from "@/lib/types";

export default async function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: notes } = await supabase
    .from("notes")
    .select("id, title, slug, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar notes={(notes as NoteSummary[]) ?? []} userId={user.id} />
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {children}
      </Box>
    </Box>
  );
}
