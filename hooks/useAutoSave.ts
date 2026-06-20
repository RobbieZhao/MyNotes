import { useEffect, useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave<T>(
  value: T,
  saveFn: (value: T) => Promise<void>,
  delay = 500
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const isFirstRender = useRef(true);
  const saveFnRef = useRef(saveFn);

  saveFnRef.current = saveFn;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setStatus("saving");
    const timer = setTimeout(async () => {
      try {
        await saveFnRef.current(value);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return status;
}
