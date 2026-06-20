"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface ResizableCollapsiblePanelProps {
  storageKey: string;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  collapseDirection?: "left" | "right";
  children: ReactNode;
}

export function ResizableCollapsiblePanel({
  storageKey,
  defaultWidth = 260,
  minWidth = 200,
  maxWidth = 420,
  collapseDirection = "left",
  children,
}: ResizableCollapsiblePanelProps) {
  const [visible, setVisible] = useState(true);
  const [width, setWidth] = useState(defaultWidth);
  const [dragging, setDragging] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { visible?: boolean; width?: number };
        if (typeof parsed.visible === "boolean") setVisible(parsed.visible);
        if (typeof parsed.width === "number") {
          setWidth(Math.min(maxWidth, Math.max(minWidth, parsed.width)));
        }
      }
    } catch {
      // ignore
    }
    loadedRef.current = true;
  }, [storageKey, minWidth, maxWidth]);

  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ visible, width }));
    } catch {
      // ignore
    }
  }, [storageKey, visible, width]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      const next =
        collapseDirection === "left" ? e.clientX : window.innerWidth - e.clientX;
      setWidth(Math.min(maxWidth, Math.max(minWidth, next)));
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
  }, [dragging, collapseDirection, minWidth, maxWidth]);

  const toggleVisible = useCallback(() => setVisible((v) => !v), []);

  if (!visible) {
    return (
      <Box
        sx={{
          width: 36,
          flexShrink: 0,
          borderRight: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          pt: 1,
          bgcolor: "background.paper",
        }}
      >
        <Tooltip title="Show panel">
          <IconButton size="small" onClick={toggleVisible} aria-label="Show panel">
            {collapseDirection === "left" ? (
              <ChevronRightIcon fontSize="small" />
            ) : (
              <ChevronLeftIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexShrink: 0, height: "100%" }}>
      <Box
        sx={{
          width,
          minWidth: minWidth,
          maxWidth: maxWidth,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          bgcolor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
          position: "relative",
        }}
      >
        <Tooltip title="Hide panel">
          <IconButton
            size="small"
            onClick={toggleVisible}
            aria-label="Hide panel"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
            }}
          >
            {collapseDirection === "left" ? (
              <ChevronLeftIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        {children}
      </Box>
      <Box
        onMouseDown={() => setDragging(true)}
        sx={{
          width: 6,
          flexShrink: 0,
          cursor: "col-resize",
          bgcolor: dragging ? "primary.light" : "transparent",
          "&:hover": { bgcolor: "action.hover" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
    </Box>
  );
}
