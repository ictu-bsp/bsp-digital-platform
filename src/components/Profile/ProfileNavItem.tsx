interface ProfileNavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export default function ProfileNavItem({
  icon,
  label,
  isActive,
  onClick,
}: ProfileNavItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-1 text-[0.72rem] transition"
    >
      <span className={isActive ? "text-green-900" : "text-gray-400"}>{icon}</span>
      <span
        className={
          isActive
            ? "text-center text-[0.72rem] font-semibold text-green-900"
            : "text-center text-[0.72rem] text-gray-400"
        }
      >
        {label}
      </span>
    </button>
  );
}
