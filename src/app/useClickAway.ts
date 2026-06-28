"use client";

import { useEffect, type RefObject } from "react";

/** Calls `onAway` when a pointerdown / Escape happens outside `ref`. */
export function useClickAway(
  ref: RefObject<HTMLElement | null>,
  onAway: () => void,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;

    function handlePointer(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onAway();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onAway();
    }

    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [ref, onAway, active]);
}
