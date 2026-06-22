"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ActiveDocumentProvider } from "@/contexts/ActiveDocumentContext";
import { DatasetsProvider } from "@/contexts/DatasetsContext";
import type { Dataset, Document } from "@/types/database";

interface DocumentsLayoutClientProps {
  initialDocuments: Document[];
  initialDatasets?: Dataset[];
  children: React.ReactNode;
}

export function DocumentsLayoutClient({
  initialDocuments,
  initialDatasets = [],
  children,
}: DocumentsLayoutClientProps) {
  const [documents, setDocuments] = useState(initialDocuments);

  return (
    <ActiveDocumentProvider>
      <DatasetsProvider initialDatasets={initialDatasets}>
        <Box sx={{ display: "flex", height: "100vh" }}>
          <Sidebar documents={documents} onDocumentsChange={setDocuments} />
          <Box component="main" sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "hidden" }}>
            {children}
          </Box>
        </Box>
      </DatasetsProvider>
    </ActiveDocumentProvider>
  );
}

export function EmptyDocumentState() {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="body1" color="text.secondary">
        Select a document or create a new one to get started.
      </Typography>
    </Box>
  );
}
