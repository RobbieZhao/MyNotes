"use client";

import Typography from "@mui/material/Typography";

interface SaveStatusProps {
  status: "idle" | "saving" | "saved" | "error";
}

export function SaveStatus({ status }: SaveStatusProps) {
  if (status === "idle") return null;

  const labels = {
    saving: "Saving…",
    saved: "Saved",
    error: "Save failed",
  } as const;

  const colors = {
    saving: "text.secondary",
    saved: "success.main",
    error: "error.main",
  } as const;

  return (
    <Typography variant="caption" color={colors[status]}>
      {labels[status]}
    </Typography>
  );
}
