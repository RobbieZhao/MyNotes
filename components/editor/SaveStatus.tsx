import Typography from "@mui/material/Typography";
import type { SaveStatus } from "@/lib/types";

const labels: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Failed to save",
};

export default function SaveStatus({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  return (
    <Typography
      variant="caption"
      color={status === "error" ? "error" : "text.secondary"}
      sx={{ px: 2, py: 0.5 }}
    >
      {labels[status]}
    </Typography>
  );
}
