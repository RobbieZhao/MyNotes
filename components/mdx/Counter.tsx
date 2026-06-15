"use client";

import { useState } from "react";
import Button from "@mui/material/Button";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <Button
      variant="contained"
      onClick={() => setCount((c) => c + 1)}
    >
      Count: {count}
    </Button>
  );
}
