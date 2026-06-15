"use client";

import { useEffect, useState } from "react";
import { MDXRemote } from "next-mdx-remote";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { serializeMdx } from "@/app/actions/mdx";
import { NoteContextProvider } from "@/components/NoteContextProvider";
import { mdxComponents } from "@/lib/mdx/components";
import { useDebounce } from "@/hooks/useDebounce";

export default function MdxPreview({
  content,
  noteId,
}: {
  content: string;
  noteId: string;
}) {
  const debouncedContent = useDebounce(content, 400);
  const [serialized, setSerialized] =
    useState<MDXRemoteSerializeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function compile() {
      setLoading(true);
      setError(null);
      try {
        const result = await serializeMdx(debouncedContent || "");
        if (!cancelled) {
          setSerialized(result);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to compile MDX");
          setSerialized(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    compile();

    return () => {
      cancelled = true;
    };
  }, [debouncedContent]);

  return (
    <Box
      sx={{
        flex: 1,
        overflow: "auto",
        p: 3,
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 2, display: "block" }}
      >
        Preview
      </Typography>

      {loading && !serialized && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      {serialized && (
        <Box className="prose-preview">
          <NoteContextProvider noteId={noteId}>
            <MDXRemote {...serialized} components={mdxComponents} />
          </NoteContextProvider>
        </Box>
      )}
    </Box>
  );
}
