import { ArrowLeftIcon } from "@heroicons/react/24/solid";

interface BackButtonProps {
  onClick?: () => void;
  label?: string;
  ariaLabel?: string;
  className?: string;
}

export default function BackButton({
  onClick,
  label = "Back",
  ariaLabel,
  className = "",
}: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      className={`inline-flex items-center gap-2 rounded-full border border-green-900 bg-white px-4 py-2 text-sm font-semibold text-green-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-50 hover:shadow-sm active:translate-y-0 ${className}`}
    >
      <ArrowLeftIcon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
