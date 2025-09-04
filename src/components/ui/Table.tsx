import React from "react";

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;
export function Table({ children, className, ...props }: TableProps) {
  return <table className={`w-full text-right border-collapse ${className || ""}`} {...props}>{children}</table>;
}

type ThProps = React.ThHTMLAttributes<HTMLTableCellElement>;
export function Th({ children, className, ...props }: ThProps) {
  return <th className={`px-3 py-2 font-bold text-gray-700 ${className || ""}`} {...props}>{children}</th>;
}

type TdProps = React.TdHTMLAttributes<HTMLTableCellElement>;
export function Td({ children, className, ...props }: TdProps) {
  return <td className={`px-3 py-2 ${className || ""}`} {...props}>{children}</td>;
}
