"use client";

import { useEffect } from "react";
import { clearBookCache } from "@/lib/book-cache";

export function ClearBookCache() {
  useEffect(() => {
    void clearBookCache();
  }, []);

  return null;
}