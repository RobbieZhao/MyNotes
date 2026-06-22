"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";

interface DatasetNameFieldProps {
  value: string;
  onSave: (name: string) => Promise<string | null>;
}

export function DatasetNameField({ value, onSave }: DatasetNameFieldProps) {
  const [localName, setLocalName] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalName(value);
  }, [value]);

  const commit = async () => {
    const trimmed = localName.trim();
    if (!trimmed) {
      setLocalName(value);
      setError("Dataset name cannot be empty.");
      return;
    }
    if (trimmed === value) {
      setError(null);
      return;
    }

    setSaving(true);
    setError(null);
    const saveError = await onSave(trimmed);
    setSaving(false);

    if (saveError) {
      setError(saveError);
      setLocalName(value);
    }
  };

  return (
    <>
      <TextField
        label="Dataset name"
        value={localName}
        onChange={(event) => setLocalName(event.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void commit();
            (event.target as HTMLInputElement).blur();
          }
          if (event.key === "Escape") {
            setLocalName(value);
            setError(null);
            (event.target as HTMLInputElement).blur();
          }
        }}
        fullWidth
        size="small"
        disabled={saving}
        sx={{ maxWidth: 480 }}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 1, maxWidth: 480 }}>
          {error}
        </Alert>
      )}
    </>
  );
}
