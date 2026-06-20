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
import { normalizeDatasetConfig, type DatasetConfig } from "@/types/dataset";

function normalizeDataset(raw: Dataset): Dataset {
  return {
    ...raw,
    config: normalizeDatasetConfig(raw.config),
  };
}

interface DatasetsContextValue {
  datasets: Dataset[];
  refreshDatasets: () => Promise<void>;
  createDataset: (
    name: string,
    data: Dataset["data"],
    config: DatasetConfig
  ) => Promise<Dataset | null>;
  updateDatasetConfig: (id: string, config: DatasetConfig) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;
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
    const { data } = await supabase
      .from("datasets")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setDatasets((data as Dataset[]).map(normalizeDataset));
  }, [supabase]);

  const createDataset = useCallback(
    async (name: string, data: Dataset["data"], config: DatasetConfig) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: created, error } = await supabase
        .from("datasets")
        .insert({ name, data, config, user_id: user.id })
        .select("*")
        .single();
      if (!error && created) {
        const dataset = normalizeDataset(created as Dataset);
        setDatasets((prev) => [dataset, ...prev]);
        return dataset;
      }
      return null;
    },
    [supabase]
  );

  const updateDatasetConfig = useCallback(
    async (id: string, config: DatasetConfig) => {
      const { error } = await supabase.from("datasets").update({ config }).eq("id", id);
      if (!error) {
        setDatasets((prev) =>
          prev.map((d) =>
            d.id === id ? { ...d, config: normalizeDatasetConfig(config) } : d
          )
        );
      }
    },
    [supabase]
  );

  const deleteDataset = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("datasets").delete().eq("id", id);
      if (!error) setDatasets((prev) => prev.filter((d) => d.id !== id));
    },
    [supabase]
  );

  const value = useMemo(
    () => ({
      datasets,
      refreshDatasets,
      createDataset,
      updateDatasetConfig,
      deleteDataset,
    }),
    [datasets, refreshDatasets, createDataset, updateDatasetConfig, deleteDataset]
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
