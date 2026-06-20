"use client";

import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TouchAppOutlinedIcon from "@mui/icons-material/TouchAppOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { BlockPreview, BLOCK_DESCRIPTIONS } from "@/components/editor/blockPreviews";
import { BLOCK_TYPE_LABELS, type BlockType } from "@/types/blocks";

export interface BlockCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  blocks: BlockType[];
}

export const BLOCK_CATEGORIES: BlockCategory[] = [
  {
    id: "content",
    label: "Content",
    icon: <ArticleOutlinedIcon fontSize="small" />,
    blocks: ["text", "code", "todo_list"],
  },
  {
    id: "visualization",
    label: "Visualizations",
    icon: <BarChartOutlinedIcon fontSize="small" />,
    blocks: ["line_chart", "pie_chart", "bar_chart_race"],
  },
  {
    id: "interactive",
    label: "Data & Interactive",
    icon: <TouchAppOutlinedIcon fontSize="small" />,
    blocks: ["timeline", "multi_select", "data_table"],
  },
];

interface AddBlockModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: BlockType) => void;
}

export function AddBlockModal({ open, onClose, onSelect }: AddBlockModalProps) {
  const theme = useTheme();
  const [activeCategory, setActiveCategory] = useState(BLOCK_CATEGORIES[0].id);

  const category = useMemo(
    () => BLOCK_CATEGORIES.find((c) => c.id === activeCategory) ?? BLOCK_CATEGORIES[0],
    [activeCategory],
  );

  const handleSelect = (type: BlockType) => {
    onSelect(type);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(4px)",
            backgroundColor: alpha(theme.palette.common.black, 0.45),
          },
        },
        paper: {
          sx: {
            width: "min(920px, calc(100vw - 48px))",
            height: "min(620px, calc(100vh - 48px))",
            maxWidth: "none",
            maxHeight: "none",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.12)",
          },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
            borderBottom: 1,
            borderColor: "divider",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Add a block
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Choose a block type to insert into your document
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close" size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
          <Box
            sx={{
              width: 220,
              flexShrink: 0,
              borderRight: 1,
              borderColor: "divider",
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              py: 2,
              px: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            {BLOCK_CATEGORIES.map((cat) => {
              const selected = cat.id === activeCategory;
              return (
                <Box
                  key={cat.id}
                  component="button"
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    border: "none",
                    borderRadius: 2,
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    bgcolor: selected ? "background.paper" : "transparent",
                    color: selected ? "primary.main" : "text.primary",
                    boxShadow: selected ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    fontWeight: selected ? 600 : 500,
                    fontSize: 14,
                    fontFamily: "inherit",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: selected ? "background.paper" : alpha(theme.palette.primary.main, 0.06),
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      bgcolor: selected
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.action.active, 0.06),
                      color: selected ? "primary.main" : "text.secondary",
                    }}
                  >
                    {cat.icon}
                  </Box>
                  {cat.label}
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: 3,
              bgcolor: "background.default",
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: "block", mb: 2, letterSpacing: 1.2 }}
            >
              {category.label}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 2,
              }}
            >
              {category.blocks.map((type) => (
                <Box
                  key={type}
                  component="button"
                  type="button"
                  onClick={() => handleSelect(type)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2.5,
                    bgcolor: "background.paper",
                    cursor: "pointer",
                    textAlign: "left",
                    overflow: "hidden",
                    fontFamily: "inherit",
                    p: 0,
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                      transform: "translateY(-2px)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                      borderBottom: 1,
                      borderColor: "divider",
                      aspectRatio: "16 / 10",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box sx={{ width: "100%", maxWidth: 200 }}>
                      <BlockPreview type={type} />
                    </Box>
                  </Box>
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {BLOCK_TYPE_LABELS[type]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: "block", lineHeight: 1.4 }}>
                      {BLOCK_DESCRIPTIONS[type]}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
