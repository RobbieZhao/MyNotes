"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import NoteListItem from "@/components/sidebar/NoteListItem";
import { createClient } from "@/lib/supabase/client";
import type { NoteSummary } from "@/lib/types";

type SidebarProps = {
  notes: NoteSummary[];
  userId: string;
};

export default function Sidebar({ notes, userId }: SidebarProps) {
  const router = useRouter();

  async function handleNewNote() {
    const supabase = createClient();
    const suffix = Date.now().toString(36).slice(-4);
    const slug = `untitled-${suffix}`;

    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: userId,
        title: "Untitled",
        slug,
        content: "",
      })
      .select("id")
      .single();

    if (error || !data) return;

    router.push(`/notes/${data.id}`);
    router.refresh();
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRight: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          My Notes
        </Typography>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleNewNote}
        >
          New Note
        </Button>
      </Box>

      <Divider />

      <List
        sx={{
          flex: 1,
          overflow: "auto",
          py: 1,
        }}
      >
        {notes.map((note) => (
          <NoteListItem key={note.id} id={note.id} title={note.title} />
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Button
          variant="text"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          color="inherit"
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}
