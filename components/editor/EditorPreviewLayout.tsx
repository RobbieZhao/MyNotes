"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const STORAGE_KEY = "mynotes-editor-layout";
const MIN_EDITOR_WIDTH = 280;
const MIN_PREVIEW_WIDTH = 280;
const DEFAULT_EDITOR_RATIO = 0.5;

interface EditorLayoutPrefs {
  editorVisible: boolean;
  editorRatio: number;
}

function loadPrefs(): EditorLayoutPrefs {
  if (typeof window === "undefined") {
    return { editorVisible: true, editorRatio: DEFAULT_EDITOR_RATIO };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { editorVisible: true, editorRatio: DEFAULT_EDITOR_RATIO };
    const parsed = JSON.parse(raw) as Partial<EditorLayoutPrefs>;
    return {
      editorVisible: parsed.editorVisible ?? true,
      editorRatio:
        typeof parsed.editorRatio === "number"
          ? Math.min(0.75, Math.max(0.25, parsed.editorRatio))
          : DEFAULT_EDITOR_RATIO,
    };
  } catch {
    return { editorVisible: true, editorRatio: DEFAULT_EDITOR_RATIO };
  }
}

function savePrefs(prefs: EditorLayoutPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota errors
  }
}

interface EditorPreviewLayoutProps {
  editor: React.ReactNode;
  preview: React.ReactNode;
}

export function EditorPreviewLayout({ editor, preview }: EditorPreviewLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefs, setPrefs] = useState<EditorLayoutPrefs>({
    editorVisible: true,
    editorRatio: DEFAULT_EDITOR_RATIO,
  });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  const setEditorVisible = useCallback((editorVisible: boolean) => {
    setPrefs((prev) => ({ ...prev, editorVisible }));
  }, []);

  const setEditorRatio = useCallback((editorRatio: number) => {
    setPrefs((prev) => ({ ...prev, editorRatio }));
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const ratio = x / rect.width;
      const maxRatio = (rect.width - MIN_PREVIEW_WIDTH) / rect.width;
      const minRatio = MIN_EDITOR_WIDTH / rect.width;
      setEditorRatio(Math.min(maxRatio, Math.max(minRatio, ratio)));
    };

    const handleUp = () => setDragging(false);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, setEditorRatio]);

  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        display: "flex",
        minWidth: 0,
        minHeight: 0,
        position: "relative",
      }}
    >
      {prefs.editorVisible && (
        <>
          <Box
            sx={{
              width: `${prefs.editorRatio * 100}%`,
              minWidth: MIN_EDITOR_WIDTH,
              borderRight: 1,
              borderColor: "divider",
              p: 2,
              minHeight: 0,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {editor}
          </Box>

          <Box
            onMouseDown={() => setDragging(true)}
            sx={{
              width: 6,
              flexShrink: 0,
              cursor: "col-resize",
              bgcolor: dragging ? "primary.light" : "transparent",
              transition: "background-color 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": { bgcolor: "action.hover" },
              position: "relative",
              zIndex: 2,
            }}
          >
            <Box
              sx={{
                width: 2,
                height: 40,
                borderRadius: 1,
                bgcolor: dragging ? "primary.main" : "divider",
              }}
            />
          </Box>
        </>
      )}

      <Box
        sx={{
          flex: 1,
          minWidth: MIN_PREVIEW_WIDTH,
          p: 2,
          minHeight: 0,
          overflow: "hidden",
          bgcolor: "background.paper",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Tooltip title={prefs.editorVisible ? "Hide block editor" : "Show block editor"}>
          <IconButton
            size="small"
            onClick={() => setEditorVisible(!prefs.editorVisible)}
            sx={{
              position: "absolute",
              top: 8,
              left: prefs.editorVisible ? 8 : 8,
              zIndex: 3,
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              boxShadow: 1,
              "&:hover": { bgcolor: "action.hover" },
            }}
            aria-label={prefs.editorVisible ? "Hide block editor" : "Show block editor"}
          >
            {prefs.editorVisible ? (
              <ChevronLeftIcon fontSize="small" />
            ) : (
              <EditOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>{preview}</Box>
      </Box>
    </Box>
  );
}
