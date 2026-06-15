"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import EditorPanel from "@/components/editor/EditorPanel";
import SaveStatus from "@/components/editor/SaveStatus";
import MdxPreview from "@/components/mdx/MdxPreview";
import { useDebounce } from "@/hooks/useDebounce";
import { useAutoSave } from "@/hooks/useAutoSave";

type NoteEditorProps = {
  noteId: string;
  initialTitle: string;
  initialContent: string;
};

export default function NoteEditor({
  noteId,
  initialTitle,
  initialContent,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const debouncedTitle = useDebounce(title, 800);
  const debouncedContent = useDebounce(content, 800);

  const saveStatus = useAutoSave(
    noteId,
    title,
    content,
    debouncedTitle,
    debouncedContent
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 0,
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          borderBottom: 1,
          borderColor: "divider",
          minHeight: 28,
        }}
      >
        <SaveStatus status={saveStatus} />
      </Box>
      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        <EditorPanel
          title={title}
          content={content}
          onTitleChange={setTitle}
          onContentChange={setContent}
        />
        <Box sx={{ flex: 1, minWidth: 0, display: "flex" }}>
          <MdxPreview content={content} />
        </Box>
      </Box>
    </Box>
  );
}
