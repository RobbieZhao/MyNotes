"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import UploadIcon from "@mui/icons-material/Upload";
import { DatasetConfigFields } from "@/components/datasets/DatasetConfigEditor";
import { parseCsv, getDatasetColumns } from "@/lib/datasets/csv";
import type { Dataset } from "@/types/database";
import {
  DATA_LAYOUT_LABELS,
  DEFAULT_DATASET_CONFIG,
  normalizeDatasetConfig,
  type DatasetConfig,
} from "@/types/dataset";

interface DatasetManagerProps {
  datasets: Dataset[];
  onCreate: (name: string, data: Dataset["data"], config: DatasetConfig) => Promise<Dataset | null>;
  onUpdateConfig: (id: string, config: DatasetConfig) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DatasetManager({
  datasets,
  onCreate,
  onUpdateConfig,
  onDelete,
}: DatasetManagerProps) {
  const [importOpen, setImportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [csvText, setCsvText] = useState("");
  const [config, setConfig] = useState<DatasetConfig>(DEFAULT_DATASET_CONFIG);

  const previewRows = csvText.trim() ? parseCsv(csvText).rows : [];
  const previewColumns = getDatasetColumns(previewRows);

  const editingDataset = datasets.find((d) => d.id === editingId);

  const openImport = () => {
    setName("");
    setCsvText("");
    setConfig(DEFAULT_DATASET_CONFIG);
    setImportOpen(true);
  };

  const openEdit = (dataset: Dataset) => {
    setEditingId(dataset.id);
    setConfig(normalizeDatasetConfig(dataset.config));
    setEditOpen(true);
  };

  const handleImport = async () => {
    const { rows } = parseCsv(csvText);
    if (!name.trim() || rows.length === 0) return;

    const columns = getDatasetColumns(rows);
    const finalConfig: DatasetConfig = {
      ...config,
      keyColumn:
        config.layout === "columns_are_series"
          ? config.keyColumn ?? columns[0]
          : undefined,
      column: config.layout === "rows_are_records" ? config.column : undefined,
    };

    const created = await onCreate(name.trim(), rows, finalConfig);
    if (created) {
      setImportOpen(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!editingId) return;
    await onUpdateConfig(editingId, config);
    setEditOpen(false);
    setEditingId(null);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle2">Datasets</Typography>
        <Button size="small" startIcon={<UploadIcon />} onClick={openImport}>
          Import CSV
        </Button>
      </Box>

      {datasets.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No datasets yet. Import CSV data to get started.
        </Typography>
      ) : (
        <List dense disablePadding>
          {datasets.map((dataset) => {
            const cfg = normalizeDatasetConfig(dataset.config);
            return (
              <ListItem
                key={dataset.id}
                secondaryAction={
                  <Box>
                    <IconButton edge="end" size="small" onClick={() => openEdit(dataset)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton edge="end" size="small" onClick={() => onDelete(dataset.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
                disablePadding
              >
                <ListItemButton onClick={() => openEdit(dataset)} sx={{ pr: 10 }}>
                  <ListItemText
                    primary={dataset.name}
                    secondary={`${dataset.data.length} rows · ${DATA_LAYOUT_LABELS[cfg.layout]}`}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}

      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Dataset from CSV</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Dataset name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Paste CSV"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            multiline
            minRows={6}
            fullWidth
            placeholder={"Year,China,Germany,France\n1970,92602973434,2.15838E+11,1.48456E+11"}
          />
          {previewColumns.length > 0 && (
            <DatasetConfigFields
              config={config}
              columns={previewColumns}
              onChange={setConfig}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleImport}>
            Import
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit dataset: {editingDataset?.name}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {editingDataset && (
            <DatasetConfigFields
              config={config}
              columns={getDatasetColumns(editingDataset.data)}
              onChange={setConfig}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveConfig}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
