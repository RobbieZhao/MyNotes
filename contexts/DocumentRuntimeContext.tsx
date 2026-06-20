"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GLOBAL_GROUP_KEY } from "@/lib/blocks/outline";

export interface GroupRuntimeState {
  selectedValues: string[];
  selectedX: number | null;
  linkedLineChartBlockId: string | null;
}

const DEFAULT_GROUP_STATE: GroupRuntimeState = {
  selectedValues: [],
  selectedX: null,
  linkedLineChartBlockId: null,
};

interface DocumentRuntimeContextValue {
  getGroupState: (groupKey: string) => GroupRuntimeState;
  setSelectedValues: (groupKey: string, values: string[]) => void;
  setSelectedX: (
    groupKey: string,
    x: number | null,
    sourceBlockId?: string | null
  ) => void;
}

const DocumentRuntimeContext = createContext<DocumentRuntimeContextValue | null>(null);

export function DocumentRuntimeProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Record<string, GroupRuntimeState>>({});

  const getGroupState = useCallback(
    (groupKey: string) => groups[groupKey] ?? DEFAULT_GROUP_STATE,
    [groups]
  );

  const setSelectedValues = useCallback((groupKey: string, values: string[]) => {
    setGroups((prev) => ({
      ...prev,
      [groupKey]: {
        ...(prev[groupKey] ?? DEFAULT_GROUP_STATE),
        selectedValues: values,
      },
    }));
  }, []);

  const setSelectedX = useCallback(
    (groupKey: string, x: number | null, sourceBlockId: string | null = null) => {
      setGroups((prev) => ({
        ...prev,
        [groupKey]: {
          ...(prev[groupKey] ?? DEFAULT_GROUP_STATE),
          selectedX: x,
          linkedLineChartBlockId: sourceBlockId,
        },
      }));
    },
    []
  );

  const value = useMemo(
    () => ({ getGroupState, setSelectedValues, setSelectedX }),
    [getGroupState, setSelectedValues, setSelectedX]
  );

  return (
    <DocumentRuntimeContext.Provider value={value}>
      {children}
    </DocumentRuntimeContext.Provider>
  );
}

export function useDocumentRuntime() {
  const ctx = useContext(DocumentRuntimeContext);
  if (!ctx) {
    throw new Error("useDocumentRuntime must be used within DocumentRuntimeProvider");
  }
  return ctx;
}

export function useGroupRuntime(groupId: string | null | undefined) {
  const groupKey = groupId ?? GLOBAL_GROUP_KEY;
  const { getGroupState, setSelectedValues, setSelectedX } = useDocumentRuntime();
  const state = getGroupState(groupKey);

  return {
    groupKey,
    selectedValues: state.selectedValues,
    selectedX: state.selectedX,
    linkedLineChartBlockId: state.linkedLineChartBlockId,
    setSelectedValues: (values: string[]) => setSelectedValues(groupKey, values),
    setSelectedX: (x: number | null, sourceBlockId?: string | null) =>
      setSelectedX(groupKey, x, sourceBlockId ?? null),
  };
}

/** @deprecated Use useGroupRuntime instead */
export function useLegacyDocumentRuntime() {
  const runtime = useGroupRuntime(null);
  return {
    selectedValues: runtime.selectedValues,
    setSelectedValues: runtime.setSelectedValues,
  };
}
