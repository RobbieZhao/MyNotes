"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

type NoteListItemProps = {
  id: string;
  title: string;
};

export default function NoteListItem({ id, title }: NoteListItemProps) {
  const pathname = usePathname();
  const href = `/notes/${id}`;
  const selected = pathname === href;

  return (
    <ListItemButton
      component={Link}
      href={href}
      selected={selected}
      sx={{
        borderRadius: 1,
        mx: 1,
        mb: 0.5,
        "&.Mui-selected": {
          bgcolor: "action.selected",
        },
      }}
    >
      <ListItemText
        primary={title || "Untitled"}
        slotProps={{
          primary: {
            noWrap: true,
            sx: { fontSize: "0.875rem" },
          },
        }}
      />
    </ListItemButton>
  );
}
