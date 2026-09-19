"use client";

import { useContext } from "react";
import { AppStateContext } from "./app-context";

export { AppProvider } from "./app-provider";
export { SEED_PLACES } from "./app-seed";
export type * from "./app-types";

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === null) {
    throw new Error("useAppState must be used inside AppProvider");
  }
  return context;
}
