"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { PlanBStore } from "./plan-b-types";

const PlanBStoreContext = createContext<PlanBStore | null>(null);

type PlanBProviderProps = Readonly<{
  store: PlanBStore;
  children: ReactNode;
}>;

export function PlanBProvider({ store, children }: PlanBProviderProps) {
  return <PlanBStoreContext.Provider value={store}>{children}</PlanBStoreContext.Provider>;
}

export function usePlanBStore(): PlanBStore | null {
  return useContext(PlanBStoreContext);
}
