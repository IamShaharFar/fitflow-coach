import React, { createContext, useContext, useState, useCallback } from "react";

type Toast = { id: number; message: string };
const ToastCtx = createContext<{ show: (m: string) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string) => {
    const id = Date.now();
    setToasts(s => [...s, { id, message }]);
    setTimeout(() => setToasts(s => s.filter(t => t.id !== id)), 2500);
  }, []);
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className="bg-gray-900 text-white rounded-xl px-4 py-2 shadow">{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
