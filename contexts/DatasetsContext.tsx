"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Dataset } from "@/types/database";
import {
  isImportedDatasetConfig,
  normalizeDatasetConfig,
  type ImportedDatasetConfig,
  type StoredDatasetConfig,
} from "@/types/dataset";

function normalizeDataset(raw: Dataset): Dataset {
  return {
    ...raw,
    config: raw.config,
  };
}

interface CreateDatasetResult {
  dataset: Dataset | null;
  error: string | null;
}

interface DatasetsContextValue {
  datasets: Dataset[];
  refreshDatasets: () => Promise<void>;
  getDatasetById: (id: string) => Dataset | undefined;
  createDataset: (
    name: string,
    data: Dataset["data"],
    config: StoredDatasetConfig
  ) => Promise<CreateDatasetResult>;
  updateDatasetConfig: (id: string, config: StoredDatasetConfig) => Promise<string | null>;
  updateDatasetName: (id: string, name: string) => Promise<string | null>;
  deleteDataset: (id: string) => Promise<string | null>;
}

const DatasetsContext = createContext<DatasetsContextValue | null>(null);

interface DatasetsProviderProps {
  initialDatasets?: Dataset[];
  children: ReactNode;
}

export function DatasetsProvider({ initialDatasets = [], children }: DatasetsProviderProps) {
  const supabase = useMemo(() => createClient(), []);
  const [datasets, setDatasets] = useState(() => initialDatasets.map(normalizeDataset));

  useEffect(() => {
    if (initialDatasets.length > 0) {
      setDatasets(initialDatasets.map(normalizeDataset));
    }
  }, [initialDatasets]);

  const refreshDatasets = useCallback(async () => {
    const { data, error } = await supabase
      .from("datasets")
      .select("*")
      .order("updated_at", { ascending: false });
    if (!error && data) setDatasets((data as Dataset[]).map(normalizeDataset));
  }, [supabase]);

  const getDatasetById = useCallback(
    (id: string) => datasets.find((dataset) => dataset.id === id),
    [datasets]
  );

  const createDataset = useCallback(
    async (name: string, data: Dataset["data"], config: StoredDatasetConfig) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { dataset: null, error: "You must be signed in to save datasets." };

      const { data: created, error } = await supabase
        .from("datasets")
        .insert({ name, data, config, user_id: user.id })
        .select("*")
        .single();

      if (error) {
        return { dataset: null, error: error.message };
      }

      if (created) {
        const dataset = normalizeDataset(created as Dataset);
        setDatasets((prev) => [dataset, ...prev]);
        return { dataset, error: null };
      }

      return { dataset: null, error: "Failed to create dataset." };
    },
    [supabase]
  );

  const updateDatasetConfig = useCallback(
    async (id: string, config: StoredDatasetConfig) => {
      const { error } = await supabase.from("datasets").update({ config }).eq("id", id);
      if (error) return error.message;

      setDatasets((prev) =>
        prev.map((dataset) => (dataset.id === id ? { ...dataset, config } : dataset))
      );
      return null;
    },
    [supabase]
  );

  const updateDatasetName = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return "Dataset name cannot be empty.";

      const { error } = await supabase.from("datasets").update({ name: trimmed }).eq("id", id);
      if (error) return error.message;

      setDatasets((prev) =>
        prev.map((dataset) => (dataset.id === id ? { ...dataset, name: trimmed } : dataset))
      );
      return null;
    },
    [supabase]
  );

  const deleteDataset = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("datasets").delete().eq("id", id);
      if (error) return error.message;
      setDatasets((prev) => prev.filter((dataset) => dataset.id !== id));
      return null;
    },
    [supabase]
  );

  const value = useMemo(
    () => ({
      datasets,
      refreshDatasets,
      getDatasetById,
      createDataset,
      updateDatasetConfig,
      updateDatasetName,
      deleteDataset,
    }),
    [datasets, refreshDatasets, getDatasetById, createDataset, updateDatasetConfig, updateDatasetName, deleteDataset]
  );

  return <DatasetsContext.Provider value={value}>{children}</DatasetsContext.Provider>;
}

export function useDatasets() {
  const ctx = useContext(DatasetsContext);
  if (!ctx) throw new Error("useDatasets must be used within DatasetsProvider");
  return ctx;
}

export function useOptionalDatasets() {
  return useContext(DatasetsContext);
}

export function getDatasetStats(config: StoredDatasetConfig) {
  if (isImportedDatasetConfig(config)) {
    return {
      shape: config.shape,
      rowCount: config.rowCount,
      columnCount: config.columnCount,
    };
  }

  return {
    shape: null,
    rowCount: null,
    columnCount: null,
  };
}

export function getChartConfig(config: StoredDatasetConfig) {
  return normalizeDatasetConfig(config);
}

export type { ImportedDatasetConfig };
