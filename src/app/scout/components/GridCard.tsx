import React from "react";

interface GridCardProps {
  children?: React.ReactNode;
  className?: string;
}

export default function GridCard({ children, className = "" }: GridCardProps) {
  return (
    <div className={`rounded-[1.75rem] bg-white border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
