import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function NotesPage() {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Typography color="text.secondary">
        Select a note or create a new one
      </Typography>
    </Box>
  );
}
