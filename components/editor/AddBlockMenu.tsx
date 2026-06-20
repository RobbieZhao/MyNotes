"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { useDocumentEditor } from "@/contexts/DocumentEditorContext";
import { BLOCK_TYPE_LABELS, type BlockType } from "@/types/blocks";

const BLOCK_TYPES: BlockType[] = [
  "text",
  "code",
  "todo_list",
  "multi_select",
  "line_chart",
  "pie_chart",
  "bar_chart_race",
  "data_table",
];

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSelect = async (type: BlockType) => {
    setAnchorEl(null);
    await addBlock(type, groupId);
  };

  return (
    <Box>
      {compact ? (
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ fontSize: 12, textTransform: "none" }}
        >
          {label}
        </Button>
      ) : (
        <Button
          variant="outlined"
          fullWidth
          startIcon={<AddIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
        >
          {label}
        </Button>
      )}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {BLOCK_TYPES.map((type) => (
          <MenuItem key={type} onClick={() => void handleSelect(type)}>
            {BLOCK_TYPE_LABELS[type]}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
