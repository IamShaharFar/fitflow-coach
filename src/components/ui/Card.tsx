import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;
export function Card({ children, className, ...props }: CardProps) {
  return <div className={`bg-white rounded-2xl p-4 shadow-sm ${className || ""}`} {...props}>{children}</div>;
}

type TitleProps = React.HTMLAttributes<HTMLHeadingElement> & { children: React.ReactNode };
export function CardTitle({ children, className, ...props }: TitleProps) {
  return <h3 className={`font-semibold ${className || ""}`} {...props}>{children}</h3>;
}

type MetaProps = React.HTMLAttributes<HTMLParagraphElement> & { children: React.ReactNode };
export function CardMeta({ children, className, ...props }: MetaProps) {
  return <p className={`text-sm text-gray-600 ${className || ""}`} {...props}>{children}</p>;
}
