"use client";

import Box from "@mui/material/Box";
import { BlockEditorPanel } from "./BlockEditorPanel";
import { DocumentPreview } from "./DocumentPreview";
import { DocumentStructureSidebar } from "./DocumentStructureSidebar";
import { EditorPreviewLayout } from "./EditorPreviewLayout";
import { ResizableCollapsiblePanel } from "@/components/layout/ResizableCollapsiblePanel";

export function DocumentEditor() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 2 }}>
      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <ResizableCollapsiblePanel
          storageKey="mynotes-structure-sidebar"
          defaultWidth={240}
          minWidth={200}
          maxWidth={360}
          collapseDirection="left"
        >
          <DocumentStructureSidebar />
        </ResizableCollapsiblePanel>
        <EditorPreviewLayout
          editor={<BlockEditorPanel />}
          preview={<DocumentPreview />}
        />
      </Box>
    </Box>
  );
}
