"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import { BlockEditor } from "@/components/blocks/BlockRenderer";
import { useDocumentEditor } from "@/contexts/DocumentEditorContext";
import { BLOCK_TYPE_LABELS } from "@/types/blocks";
import type { BlockRow } from "@/types/database";

interface BlockEditorItemProps {
  block: BlockRow;
}

export function BlockEditorItem({ block }: BlockEditorItemProps) {
  const { datasets, updateBlock, deleteBlock } = useDocumentEditor();

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Chip label={BLOCK_TYPE_LABELS[block.type]} size="small" />
        <IconButton size="small" onClick={() => void deleteBlock(block.id)} aria-label="Delete block">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
      {block.group_id && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          This block is in a group. Reorder it from the structure sidebar.
        </Typography>
      )}
      <BlockEditor
        block={block}
        datasets={datasets}
        onChange={(data) => updateBlock(block.id, data)}
      />
    </Paper>
  );
}
