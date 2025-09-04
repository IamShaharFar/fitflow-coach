import React from "react";
export function Select({ className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-600 ${className}`} {...props} />;
}
