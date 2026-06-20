"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { BlockPreview } from "@/components/blocks/BlockRenderer";
import { BlockGroupFrame } from "@/components/editor/BlockGroupFrame";
import { useDocumentEditor } from "@/contexts/DocumentEditorContext";

export function DocumentPreview() {
  const { displayOutline, datasets, blocks, previewScrollKey } = useDocumentEditor();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  useEffect(() => {
    if (!previewScrollKey) return;

    if (previewScrollKey.startsWith("group-")) {
      const groupId = previewScrollKey.slice("group-".length);
      setCollapsedGroups((prev) => {
        if (!prev.has(groupId)) return prev;
        const next = new Set(prev);
        next.delete(groupId);
        return next;
      });
    }

    requestAnimationFrame(() => {
      const el = document.getElementById(`preview-${previewScrollKey}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [previewScrollKey]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Typography variant="h6" sx={{ mb: 2, pl: 5 }}>
        Live Preview
      </Typography>
      <Stack spacing={3} sx={{ flex: 1, overflow: "auto", minWidth: 0, pr: 0.5 }}>
        {displayOutline.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Preview will appear here as you add blocks.
          </Typography>
        ) : (
          displayOutline.map((node) => {
            if (node.kind === "block") {
              return (
                <Box
                  key={node.block.id}
                  id={`preview-block-${node.block.id}`}
                  sx={{ scrollMarginTop: 16, position: "relative", zIndex: 1 }}
                >
                  <BlockPreview block={node.block} datasets={datasets} allBlocks={blocks} />
                </Box>
              );
            }

            const collapsed = collapsedGroups.has(node.group.id);
            return (
              <Box
                key={node.group.id}
                id={`preview-group-${node.group.id}`}
                sx={{ scrollMarginTop: 16, position: "relative", zIndex: 3, width: "100%", minWidth: 0 }}
              >
                <BlockGroupFrame
                  label={node.group.name}
                  blockCount={node.blocks.length}
                  collapsed={collapsed}
                  onToggleCollapsed={() => toggleGroup(node.group.id)}
                >
                  {node.blocks.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No blocks in this group yet.
                    </Typography>
                  ) : (
                    node.blocks.map((block) => (
                      <Box key={block.id} id={`preview-block-${block.id}`} sx={{ scrollMarginTop: 8 }}>
                        <BlockPreview block={block} datasets={datasets} allBlocks={blocks} />
                      </Box>
                    ))
                  )}
                </BlockGroupFrame>
              </Box>
            );
          })
        )}
      </Stack>
    </Box>
  );
}
