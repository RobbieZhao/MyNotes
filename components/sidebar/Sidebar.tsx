"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOptionalActiveDocument } from "@/contexts/ActiveDocumentContext";
import { ResizableCollapsiblePanel } from "@/components/layout/ResizableCollapsiblePanel";
import { DocumentList } from "./DocumentListItem";
import type { Document } from "@/types/database";

interface SidebarProps {
  documents: Document[];
  onDocumentsChange: (documents: Document[]) => void;
}

function DocumentTitleField() {
  const activeDoc = useOptionalActiveDocument();
  if (!activeDoc?.activeDocument) return null;

  const { localTitle, setLocalTitle, commitTitle } = activeDoc;

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        label="Document name"
        value={localTitle}
        onChange={(e) => setLocalTitle(e.target.value)}
        onBlur={() => void commitTitle()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void commitTitle();
            (e.target as HTMLInputElement).blur();
          }
        }}
        size="small"
        fullWidth
      />
    </Box>
  );
}

export function Sidebar({ documents, onDocumentsChange }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("documents")
      .insert({ title: "Untitled Document", user_id: user.id })
      .select("*")
      .single();

    setCreating(false);

    if (!error && data) {
      const doc = data as Document;
      onDocumentsChange([doc, ...documents]);
      router.push(`/documents/${doc.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (!error) {
      const remaining = documents.filter((d) => d.id !== id);
      onDocumentsChange(remaining);
      router.push(remaining.length > 0 ? `/documents/${remaining[0].id}` : "/documents");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <ResizableCollapsiblePanel storageKey="mynotes-documents-sidebar" defaultWidth={260}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", pt: 5 }}>
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            MyNotes
          </Typography>
          <DocumentTitleField />
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={handleCreate}
            disabled={creating}
          >
            New Document
          </Button>
        </Box>

        <Divider />

        <List dense disablePadding sx={{ px: 1, py: 0.5 }}>
          <ListItemButton
            selected={pathname === "/documents/datasets"}
            onClick={() => router.push("/documents/datasets")}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <StorageOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Datasets" />
          </ListItemButton>
        </List>

        <Divider />

        <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
          <Typography variant="overline" color="text.secondary" sx={{ px: 1, display: "block" }}>
            Documents
          </Typography>
          <DocumentList documents={documents} onDelete={handleDelete} />
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Button fullWidth startIcon={<LogoutIcon />} onClick={handleLogout} color="inherit">
            Logout
          </Button>
        </Box>
      </Box>
    </ResizableCollapsiblePanel>
  );
}
