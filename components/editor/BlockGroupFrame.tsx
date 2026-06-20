"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import type { ReactNode } from "react";

interface BlockGroupFrameProps {
  label: string;
  blockCount?: number;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  children: ReactNode;
}

export function BlockGroupFrame({
  label,
  blockCount,
  collapsed = false,
  onToggleCollapsed,
  children,
}: BlockGroupFrameProps) {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: "0 1px 2px rgba(21, 101, 192, 0.06), 0 4px 16px rgba(21, 101, 192, 0.08)",
        outline: "1px solid rgba(21, 101, 192, 0.14)",
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: "linear-gradient(180deg, #42a5f5 0%, #1565c0 50%, #0d47a1 100%)",
          pointerEvents: "none",
        }}
      />

      <Box
        role={onToggleCollapsed ? "button" : undefined}
        tabIndex={onToggleCollapsed ? 0 : undefined}
        onClick={onToggleCollapsed}
        onKeyDown={
          onToggleCollapsed
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleCollapsed();
                }
              }
            : undefined
        }
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          pl: 2,
          pr: 1.5,
          py: 1.25,
          minWidth: 0,
          cursor: onToggleCollapsed ? "pointer" : "default",
          background:
            "linear-gradient(135deg, rgba(21,101,192,0.05) 0%, #fff 50%, rgba(66,165,245,0.04) 100%)",
          borderBottom: collapsed ? "none" : "1px solid rgba(21, 101, 192, 0.1)",
          borderRadius: collapsed ? 2 : "8px 8px 0 0",
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FolderOutlinedIcon sx={{ fontSize: 17, color: "#fff" }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {label || "Untitled Group"}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
            Linked blocks · filters & charts interact here
          </Typography>
        </Box>

        {typeof blockCount === "number" && (
          <Typography
            variant="caption"
            sx={{
              flexShrink: 0,
              px: 1,
              py: 0.25,
              borderRadius: 99,
              fontWeight: 600,
              color: "primary.main",
              border: "1px solid rgba(21, 101, 192, 0.2)",
              bgcolor: "rgba(21, 101, 192, 0.06)",
              whiteSpace: "nowrap",
            }}
          >
            {blockCount} block{blockCount === 1 ? "" : "s"}
          </Typography>
        )}

        {onToggleCollapsed && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapsed();
            }}
            aria-label={collapsed ? "Expand group" : "Collapse group"}
            sx={{ flexShrink: 0, ml: 0.5 }}
          >
            {collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>

      {!collapsed && (
        <Box sx={{ pl: 2, pr: 2, py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}
