//src/components-general/ui/LoadingSpinner.tsx

"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={[
        "animate-spin rounded-full",
        "border-emerald-700",
        "border-t-transparent",
        sizeClasses[size],
        className,
      ].join(" ")}
    />
  );
}