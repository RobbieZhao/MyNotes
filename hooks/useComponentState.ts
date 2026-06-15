import { useCallback, useEffect, useRef, useState } from "react";
import {
  getComponentState,
  saveComponentState,
} from "@/lib/component-state";
import type { SaveStatus } from "@/lib/types";
import { useDebounce } from "@/hooks/useDebounce";

type UseComponentStateOptions<T extends Record<string, unknown>> = {
  noteId: string;
  componentKey: string;
  componentType: string;
  initialData: T;
};

export function useComponentState<T extends Record<string, unknown>>({
  noteId,
  componentKey,
  componentType,
  initialData,
}: UseComponentStateOptions<T>) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const lastSavedRef = useRef(JSON.stringify(initialData));
  const debouncedData = useDebounce(data, 1000);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const stored = await getComponentState<T>(noteId, componentKey);

      if (cancelled) return;

      if (stored) {
        setData(stored);
        lastSavedRef.current = JSON.stringify(stored);
      } else {
        lastSavedRef.current = JSON.stringify(initialData);
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [noteId, componentKey, initialData]);

  const persist = useCallback(
    async (value: T) => {
      setSaveStatus("saving");
      const { error } = await saveComponentState(
        noteId,
        componentKey,
        componentType,
        value
      );

      if (error) {
        setSaveStatus("error");
        return;
      }

      lastSavedRef.current = JSON.stringify(value);
      setSaveStatus("saved");
    },
    [noteId, componentKey, componentType]
  );

  useEffect(() => {
    if (loading) return;

    const serialized = JSON.stringify(debouncedData);
    if (serialized === lastSavedRef.current) return;

    let cancelled = false;

    async function autoSave() {
      setSaveStatus("saving");
      const { error } = await saveComponentState(
        noteId,
        componentKey,
        componentType,
        debouncedData
      );

      if (cancelled) return;

      if (error) {
        setSaveStatus("error");
        return;
      }

      lastSavedRef.current = serialized;
      setSaveStatus("saved");
    }

    autoSave();

    return () => {
      cancelled = true;
    };
  }, [debouncedData, loading, noteId, componentKey, componentType]);

  useEffect(() => {
    if (
      JSON.stringify(data) !== JSON.stringify(debouncedData) &&
      saveStatus === "saved"
    ) {
      setSaveStatus("idle");
    }
  }, [data, debouncedData, saveStatus]);

  const save = useCallback(async () => {
    await persist(data);
  }, [data, persist]);

  return { data, setData, save, loading, saveStatus };
}
