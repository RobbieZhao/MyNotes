"use client";

import { createContext, useContext } from "react";

type NoteContextValue = {
  noteId: string;
};

const NoteContext = createContext<NoteContextValue | null>(null);

export function NoteContextProvider({
  noteId,
  children,
}: {
  noteId: string;
  children: React.ReactNode;
}) {
  return (
    <NoteContext.Provider value={{ noteId }}>{children}</NoteContext.Provider>
  );
}

export function useNoteContext() {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNoteContext must be used within NoteContextProvider");
  }
  return context;
}
