import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
};

const classesBy = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  ghost: "bg-transparent hover:bg-gray-100",
  destructive: "bg-red-600 text-white hover:bg-red-700",
};

const sizeBy = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
  lg: "px-5 py-2.5 text-lg"
};

export function Button({ variant = "primary", size = "md", className = "", ...props }: Props) {
  return (
    <button
      className={`rounded-xl shadow-sm transition-colors duration-150 ${classesBy[variant]} ${sizeBy[size]} ${className}`}
      {...props}
    />
  );
}
