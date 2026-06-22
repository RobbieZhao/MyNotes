"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DatasetMappingEditor } from "@/components/datasets/DatasetMappingEditor";
import { DatasetPreviewTable } from "@/components/datasets/DatasetPreviewTable";
import { DatasetShapeCard } from "@/components/datasets/DatasetShapeCard";
import { DatasetSummaryCard } from "@/components/datasets/DatasetSummaryCard";
import { DatasetUploader } from "@/components/datasets/DatasetUploader";
import { useDatasets } from "@/contexts/DatasetsContext";
import { detectDatasetShape, redetectWithShape } from "@/lib/datasets/detectDatasetShape";
import {
  buildImportedConfig,
  type ColumnMetadata,
  type DatasetDetectionResult,
  type DatasetMapping,
  type DatasetShape,
} from "@/lib/datasets/datasetTypes";
import { parseCsv, parseCsvFile } from "@/lib/datasets/parseCsv";
import type { Dataset } from "@/types/database";

const STEPS = ["Import CSV", "Preview data", "Detection results", "Save dataset"];

export function DatasetImportWizard() {
  const router = useRouter();
  const { createDataset } = useDatasets();

  const [activeStep, setActiveStep] = useState(0);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [detection, setDetection] = useState<DatasetDetectionResult | null>(null);
  const [shape, setShape] = useState<DatasetShape>("generic");
  const [columns, setColumns] = useState<ColumnMetadata[]>([]);
  const [mapping, setMapping] = useState<DatasetMapping>({ columns: [] });
  const [datasetName, setDatasetName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = useMemo(() => {
    if (!detection) return null;
    return buildImportedConfig(rows, {
      ...detection,
      shape,
      columns,
      mapping,
    });
  }, [rows, detection, shape, columns, mapping]);

  const applyParsedRows = (parsedRows: Record<string, unknown>[]) => {
    const detected = detectDatasetShape(parsedRows);
    setRows(parsedRows);
    setDetection(detected);
    setShape(detected.shape);
    setColumns(detected.columns);
    setMapping(detected.mapping);
    setActiveStep(1);
  };

  const processCsvText = async (text: string, label: string, defaultName: string) => {
    setLoading(true);
    setError(null);
    setSourceLabel(label);
    setDatasetName(defaultName);

    try {
      const parsedRows = parseCsv(text);
      if (parsedRows.length === 0) {
        throw new Error("The CSV does not contain any data rows.");
      }
      applyParsedRows(parsedRows);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to parse CSV.");
      setRows([]);
      setDetection(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);
    setSourceLabel(file.name);
    setDatasetName(file.name.replace(/\.csv$/i, ""));

    try {
      const parsedRows = await parseCsvFile(file);
      if (parsedRows.length === 0) {
        throw new Error("The CSV file does not contain any data rows.");
      }
      applyParsedRows(parsedRows);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to parse CSV file.");
      setRows([]);
      setDetection(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = (text: string) => {
    void processCsvText(text, "Pasted CSV", "Pasted dataset");
  };

  const handleShapeChange = (nextShape: DatasetShape) => {
    setShape(nextShape);
    setMapping(redetectWithShape(rows, nextShape, columns));
  };

  const canContinueFromPreview = rows.length > 0;
  const canContinueFromDetection = Boolean(shape && columns.length > 0);
  const canSave = datasetName.trim().length > 0 && config !== null;

  const handleNext = () => {
    setError(null);
    setActiveStep((step) => Math.min(step + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((step) => Math.max(step - 1, 0));
  };

  const handleSave = async () => {
    if (!config || !canSave) return;

    setSaving(true);
    setError(null);

    const result = await createDataset(datasetName.trim(), rows as Dataset["data"], config);
    setSaving(false);

    if (result.error || !result.dataset) {
      setError(result.error ?? "Failed to save dataset.");
      return;
    }

    router.push(`/datasets/${result.dataset.id}`);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 960, mx: "auto" }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Import dataset
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload or paste CSV data, review the detected shape, and save it for use in charts and tables.
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} alternativeLabel>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error">{error}</Alert>}

      {activeStep === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <DatasetUploader
            onFileSelect={handleFileSelect}
            onTextSubmit={handleTextSubmit}
            disabled={loading}
          />
          {loading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Parsing {sourceLabel}…</Typography>
            </Box>
          )}
        </Box>
      )}

      {activeStep === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sourceLabel && (
            <Typography variant="body2" color="text.secondary">
              Source: {sourceLabel}
            </Typography>
          )}
          <DatasetPreviewTable rows={rows} />
        </Box>
      )}

      {activeStep === 2 && detection && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <DatasetShapeCard
            shape={shape}
            confidence={detection.confidence}
            columns={columns}
          />
          <DatasetMappingEditor
            shape={shape}
            columns={columns}
            mapping={mapping}
            onShapeChange={handleShapeChange}
            onColumnsChange={setColumns}
            onMappingChange={setMapping}
          />
        </Box>
      )}

      {activeStep === 3 && config && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Dataset name"
            value={datasetName}
            onChange={(event) => setDatasetName(event.target.value)}
            fullWidth
            required
            size="small"
          />
          <DatasetSummaryCard
            name={datasetName.trim() || "Untitled dataset"}
            shape={config.shape}
            rowCount={config.rowCount}
            columnCount={config.columnCount}
            mapping={config.mapping}
          />
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Button disabled={activeStep === 0 || saving} onClick={handleBack}>
          Back
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          {activeStep < STEPS.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && rows.length === 0) ||
                (activeStep === 1 && !canContinueFromPreview) ||
                (activeStep === 2 && !canContinueFromDetection)
              }
            >
              Continue
            </Button>
          ) : (
            <Button variant="contained" onClick={handleSave} disabled={!canSave || saving}>
              {saving ? "Saving…" : "Save dataset"}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
