"use client";

import { useCallback, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";

interface DatasetUploaderProps {
  onFileSelect: (file: File) => void;
  onTextSubmit: (text: string) => void;
  disabled?: boolean;
}

export function DatasetUploader({
  onFileSelect,
  onTextSubmit,
  disabled = false,
}: DatasetUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState("");

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file || disabled) return;
      if (!file.name.toLowerCase().endsWith(".csv")) return;
      setFileName(file.name);
      onFileSelect(file);
    },
    [disabled, onFileSelect]
  );

  const handleParseText = () => {
    if (disabled || !csvText.trim()) return;
    onTextSubmit(csvText);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          textAlign: "center",
          borderStyle: "dashed",
          borderWidth: 2,
          borderColor: dragOver ? "primary.main" : "divider",
          bgcolor: dragOver ? "action.hover" : "background.paper",
          transition: "border-color 0.2s, background-color 0.2s",
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          Upload CSV file
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Drag and drop a CSV file here, or choose one from your computer.
        </Typography>
        <Button
          variant="contained"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          Choose file
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        {fileName && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            Selected file: <Box component="span" sx={{ fontWeight: 600 }}>{fileName}</Box>
          </Typography>
        )}
      </Paper>

      <Divider>or</Divider>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <ContentPasteIcon color="action" />
          <Typography variant="h6">Paste CSV text</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Paste CSV content copied from a spreadsheet or text editor.
        </Typography>
        <TextField
          label="CSV text"
          value={csvText}
          onChange={(event) => setCsvText(event.target.value)}
          multiline
          minRows={6}
          fullWidth
          disabled={disabled}
          placeholder={"Year,Country,GDP\n2020,China,14700\n2020,USA,21000"}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="outlined"
            onClick={handleParseText}
            disabled={disabled || !csvText.trim()}
          >
            Parse pasted CSV
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
