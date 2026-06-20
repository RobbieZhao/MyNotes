"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { AddBlockModal } from "@/components/editor/AddBlockModal";
import { useDocumentEditor } from "@/contexts/DocumentEditorContext";
import type { BlockType } from "@/types/blocks";

interface AddBlockMenuProps {
  groupId?: string | null;
  label?: string;
  compact?: boolean;
}

export function AddBlockMenu({
  groupId = null,
  label = "Add block",
  compact = false,
}: AddBlockMenuProps) {
  const { addBlock } = useDocumentEditor();
  const [open, setOpen] = useState(false);

  const handleSelect = async (type: BlockType) => {
    await addBlock(type, groupId);
  };

  return (
    <Box>
      {compact ? (
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ fontSize: 12, textTransform: "none" }}
        >
          {label}
        </Button>
      ) : (
        <Button
          variant="outlined"
          fullWidth
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          size="small"
        >
          {label}
        </Button>
      )}
      <AddBlockModal open={open} onClose={() => setOpen(false)} onSelect={(type) => void handleSelect(type)} />
    </Box>
  );
}
