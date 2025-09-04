import React from "react";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-600 ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";
