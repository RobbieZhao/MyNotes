"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { BlockEditorItem } from "./BlockEditorItem";
import { SaveStatus } from "./SaveStatus";
import { useDocumentEditor } from "@/contexts/DocumentEditorContext";

export function BlockEditorPanel() {
  const { blocks, selectedBlockId, saveStatus } = useDocumentEditor();
  const selectedBlock = blocks.find((block) => block.id === selectedBlockId) ?? null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minWidth: 0 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Block Editor</Typography>
        <SaveStatus status={saveStatus} />
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", pb: 2 }}>
        {!selectedBlock ? (
          <Typography variant="body2" color="text.secondary">
            Select a block from the structure sidebar to edit it.
          </Typography>
        ) : (
          <BlockEditorItem block={selectedBlock} />
        )}
      </Box>
    </Box>
  );
}
