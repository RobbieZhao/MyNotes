"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ClientOnly } from "@/components/ClientOnly";
import {
  CODE_LANGUAGES,
  CODE_LANGUAGE_LABELS,
  HIGHLIGHTER_LANGUAGE,
  type CodeLanguage,
} from "@/lib/code/languages";
import type { CodeBlockData } from "@/types/blocks";

interface CodeBlockEditorProps {
  data: CodeBlockData;
  onChange: (data: CodeBlockData) => void;
}

export function CodeBlockEditor({ data, onChange }: CodeBlockEditorProps) {
  const language = (CODE_LANGUAGES.includes(data.language as CodeLanguage)
    ? data.language
    : "typescript") as CodeLanguage;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Filename (optional)"
        value={data.filename ?? ""}
        onChange={(e) => onChange({ ...data, filename: e.target.value })}
        size="small"
        fullWidth
        placeholder="example.ts"
      />
      <FormControl fullWidth size="small">
        <InputLabel>Language</InputLabel>
        <Select
          label="Language"
          value={language}
          onChange={(e) => onChange({ ...data, language: e.target.value })}
        >
          {CODE_LANGUAGES.map((lang) => (
            <MenuItem key={lang} value={lang}>
              {CODE_LANGUAGE_LABELS[lang]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControlLabel
        control={
          <Switch
            checked={data.showLineNumbers !== false}
            onChange={(e) => onChange({ ...data, showLineNumbers: e.target.checked })}
          />
        }
        label="Show line numbers"
      />
      <TextField
        label="Code"
        value={data.code}
        onChange={(e) => onChange({ ...data, code: e.target.value })}
        multiline
        minRows={8}
        fullWidth
        size="small"
        slotProps={{
          input: {
            sx: { fontFamily: "monospace", fontSize: 13 },
          },
        }}
      />
    </Box>
  );
}

function CodeBlockShell({
  data,
  children,
}: {
  data: CodeBlockData;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        borderRadius: 1,
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
      }}
    >
      {data.filename && (
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            bgcolor: "action.hover",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
            {data.filename}
          </Typography>
        </Box>
      )}
      {children}
    </Box>
  );
}

function PlainCodeBody({ data }: { data: CodeBlockData }) {
  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: "12px 16px",
        fontSize: 13,
        fontFamily: "monospace",
        overflow: "auto",
        bgcolor: "#fafafa",
      }}
    >
      {data.code}
    </Box>
  );
}

function HighlightedCodeBody({ data, language }: { data: CodeBlockData; language: CodeLanguage }) {
  return (
    <SyntaxHighlighter
      language={HIGHLIGHTER_LANGUAGE[language]}
      style={oneLight}
      showLineNumbers={data.showLineNumbers !== false}
      customStyle={{
        margin: 0,
        borderRadius: 0,
        fontSize: 13,
        padding: "12px 16px",
      }}
      lineNumberStyle={{
        minWidth: "2.5em",
        paddingRight: "1em",
        color: "#999",
        userSelect: "none",
      }}
    >
      {data.code}
    </SyntaxHighlighter>
  );
}

export function CodeBlockPreview({ data }: { data: CodeBlockData }) {
  if (!data.code) return null;

  const language = (CODE_LANGUAGES.includes(data.language as CodeLanguage)
    ? data.language
    : "plaintext") as CodeLanguage;

  return (
    <CodeBlockShell data={data}>
      <ClientOnly fallback={<PlainCodeBody data={data} />}>
        <HighlightedCodeBody data={data} language={language} />
      </ClientOnly>
    </CodeBlockShell>
  );
}
