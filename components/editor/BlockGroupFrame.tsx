"use client";

import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { ReactNode } from "react";

interface BlockGroupFrameProps {
  label: string;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  children: ReactNode;
}

export function BlockGroupFrame({
  label,
  collapsed = false,
  onToggleCollapsed,
  children,
}: BlockGroupFrameProps) {
  const displayLabel = label.trim() || "Untitled Group";

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel shrink sx={{ bgcolor: "background.paper", px: 0.5 }}>
        {displayLabel}
      </InputLabel>
      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          pt: 2.5,
          px: 2,
          pb: collapsed ? 2 : 2,
          position: "relative",
        }}
      >
        {onToggleCollapsed && (
          <IconButton
            size="small"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand group" : "Collapse group"}
            sx={{ position: "absolute", top: 4, right: 4 }}
          >
            {collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
          </IconButton>
        )}
        {!collapsed && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: onToggleCollapsed ? 1 : 0 }}>
            {children}
          </Box>
        )}
      </Box>
    </FormControl>
  );
}
