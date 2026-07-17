"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [mounted, setMounted] = useState(false);
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  if (!mounted) return false;
  return matches;
}
