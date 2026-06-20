"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TextField from "@mui/material/TextField";
import type { TextBlockData } from "@/types/blocks";

interface TextBlockEditorProps {
  data: TextBlockData;
  onChange: (data: TextBlockData) => void;
}

export function TextBlockEditor({ data, onChange }: TextBlockEditorProps) {
  return (
    <TextField
      label="Markdown content"
      value={data.content}
      onChange={(e) => onChange({ content: e.target.value })}
      multiline
      minRows={6}
      fullWidth
      size="small"
      placeholder={"# Heading\n\n**Bold** and *italic* text.\n\n- List item\n- Another item"}
      helperText="Supports Markdown syntax (headings, lists, links, bold, etc.)"
    />
  );
}

export function TextBlockPreview({ data }: { data: TextBlockData }) {
  if (!data.content) return null;

  return (
    <Box
      className="markdown-preview"
      sx={{
        "& h1": { fontSize: "1.75rem", fontWeight: 700, mt: 2, mb: 1 },
        "& h2": { fontSize: "1.4rem", fontWeight: 600, mt: 2, mb: 1 },
        "& h3": { fontSize: "1.15rem", fontWeight: 600, mt: 1.5, mb: 0.5 },
        "& p": { mb: 1.5, lineHeight: 1.6 },
        "& ul, & ol": { pl: 3, mb: 1.5 },
        "& li": { mb: 0.5 },
        "& a": { color: "primary.main" },
        "& code": {
          bgcolor: "action.hover",
          px: 0.5,
          py: 0.25,
          borderRadius: 0.5,
          fontFamily: "monospace",
          fontSize: "0.875em",
        },
        "& pre": {
          bgcolor: "action.hover",
          p: 1.5,
          borderRadius: 1,
          overflow: "auto",
          mb: 1.5,
        },
        "& pre code": { bgcolor: "transparent", p: 0 },
        "& blockquote": {
          borderLeft: 3,
          borderColor: "divider",
          pl: 2,
          ml: 0,
          color: "text.secondary",
          mb: 1.5,
        },
        "& table": { borderCollapse: "collapse", width: "100%", mb: 1.5 },
        "& th, & td": { border: 1, borderColor: "divider", px: 1, py: 0.5 },
        "& th": { bgcolor: "action.hover" },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content}</ReactMarkdown>
    </Box>
  );
}
