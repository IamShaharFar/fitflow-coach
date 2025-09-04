import React from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="סגור מודל"
      />
      <div className="absolute inset-x-4 bottom-8 md:inset-0 md:m-auto md:w-full md:max-w-md bg-white rounded-2xl shadow-xl p-4 animate-[fadeIn_.15s_ease]">
        {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
