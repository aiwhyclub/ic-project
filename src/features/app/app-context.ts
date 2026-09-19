import { createContext } from "react";
import type { AppState } from "./app-types";

export const AppStateContext = createContext<AppState | null>(null);
