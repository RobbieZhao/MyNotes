"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

type EditorPanelProps = {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
};

export default function EditorPanel({
  title,
  content,
  onTitleChange,
  onContentChange,
}: EditorPanelProps) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      <TextField
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Note title"
        variant="standard"
        fullWidth
        slotProps={{
          input: {
            disableUnderline: true,
            sx: { fontSize: "1.25rem", fontWeight: 600, px: 2, py: 1.5 },
          },
        }}
      />
      <TextField
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Write MDX content…"
        multiline
        fullWidth
        variant="standard"
        slotProps={{
          input: {
            disableUnderline: true,
            sx: {
              px: 2,
              py: 1,
              fontFamily: "monospace",
              fontSize: "0.875rem",
              lineHeight: 1.6,
            },
          },
        }}
        sx={{
          flex: 1,
          "& .MuiInputBase-root": {
            height: "100%",
            alignItems: "flex-start",
          },
          "& textarea": {
            height: "100% !important",
            overflow: "auto !important",
          },
        }}
      />
    </Box>
  );
}
