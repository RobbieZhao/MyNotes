"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Document } from "@/types/database";

interface ActiveDocumentContextValue {
  activeDocument: Document | null;
  setActiveDocument: (doc: Document | null) => void;
  localTitle: string;
  setLocalTitle: (title: string) => void;
  commitTitle: () => Promise<void>;
  registerTitleCommit: (fn: (title: string) => Promise<void>) => void;
}

const ActiveDocumentContext = createContext<ActiveDocumentContextValue | null>(null);

export function ActiveDocumentProvider({ children }: { children: ReactNode }) {
  const [activeDocument, setActiveDocumentState] = useState<Document | null>(null);
  const [localTitle, setLocalTitle] = useState("");
  const commitFnRef = useState<{ current: ((title: string) => Promise<void>) | null }>({
    current: null,
  })[0];

  const setActiveDocument = useCallback((doc: Document | null) => {
    setActiveDocumentState(doc);
    setLocalTitle(doc?.title ?? "");
  }, []);

  const registerTitleCommit = useCallback(
    (fn: (title: string) => Promise<void>) => {
      commitFnRef.current = fn;
    },
    [commitFnRef]
  );

  const commitTitle = useCallback(async () => {
    if (!activeDocument || !commitFnRef.current) return;
    const trimmed = localTitle.trim() || "Untitled Document";
    if (trimmed === activeDocument.title) return;
    await commitFnRef.current(trimmed);
    setActiveDocumentState((prev) => (prev ? { ...prev, title: trimmed } : prev));
    setLocalTitle(trimmed);
  }, [activeDocument, commitFnRef, localTitle]);

  const value = useMemo(
    () => ({
      activeDocument,
      setActiveDocument,
      localTitle,
      setLocalTitle,
      commitTitle,
      registerTitleCommit,
    }),
    [activeDocument, setActiveDocument, localTitle, commitTitle, registerTitleCommit]
  );

  return (
    <ActiveDocumentContext.Provider value={value}>
      {children}
    </ActiveDocumentContext.Provider>
  );
}

export function useActiveDocument() {
  const ctx = useContext(ActiveDocumentContext);
  if (!ctx) throw new Error("useActiveDocument must be used within ActiveDocumentProvider");
  return ctx;
}

export function useOptionalActiveDocument() {
  return useContext(ActiveDocumentContext);
}
