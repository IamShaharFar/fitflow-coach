import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { AppProviders } from "./app/providers/AppProviders";
import { App } from "./app/App";
import { ResponsiveGuard } from "./ResponsiveGuard";

const rootEl = document.getElementById("root")!;
createRoot(rootEl).render(
  <React.StrictMode>
    <AppProviders>
      <ResponsiveGuard>
        <App />
      </ResponsiveGuard>
    </AppProviders>
  </React.StrictMode>
);
