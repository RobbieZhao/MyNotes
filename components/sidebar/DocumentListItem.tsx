"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter, usePathname } from "next/navigation";
import type { Document } from "@/types/database";

interface DocumentListItemProps {
  document: Document;
  selected: boolean;
  onDelete: (id: string) => void;
}

export function DocumentListItem({ document, selected, onDelete }: DocumentListItemProps) {
  const router = useRouter();

  return (
    <ListItemButton
      selected={selected}
      onClick={() => router.push(`/documents/${document.id}`)}
      sx={{ borderRadius: 1, pr: 6 }}
    >
      <ListItemText
        primary={document.title}
        slotProps={{ primary: { noWrap: true } }}
      />
      <IconButton
        size="small"
        edge="end"
        sx={{ position: "absolute", right: 8 }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(document.id);
        }}
        aria-label={`Delete ${document.title}`}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </ListItemButton>
  );
}

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  const pathname = usePathname();

  if (documents.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
        No documents yet.
      </Typography>
    );
  }

  return (
    <List dense disablePadding>
      {documents.map((doc) => (
        <DocumentListItem
          key={doc.id}
          document={doc}
          selected={pathname === `/documents/${doc.id}`}
          onDelete={onDelete}
        />
      ))}
    </List>
  );
}
