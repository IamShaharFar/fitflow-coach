import React from "react";
import { QueryProvider } from "./QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { BrowserRouter } from "react-router-dom";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <QueryProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}
