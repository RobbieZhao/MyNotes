import { DatasetImportWizard } from "@/components/datasets/DatasetImportWizard";
import Box from "@mui/material/Box";

export default function DatasetImportPage() {
  return (
    <Box sx={{ height: "100%", overflow: "auto", p: 3 }}>
      <DatasetImportWizard />
    </Box>
  );
}
