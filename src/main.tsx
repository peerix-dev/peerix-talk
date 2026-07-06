import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { App } from "./app.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { StorageProvider } from "@/hooks/use-storage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <StorageProvider>
        <App />
      </StorageProvider>
    </ThemeProvider>
  </StrictMode>,
);
