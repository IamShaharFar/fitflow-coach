import React from "react";

export function Tabs({ tabs, current, onChange }: { tabs: { key: string; label: string }[]; current: string; onChange: (k: string) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4 w-full">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-3 py-1.5 rounded-xl border ${current === t.key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
