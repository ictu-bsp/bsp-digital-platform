//src/app/scout/profile/components/ProfileNavItem.tsx

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
      <span className="text-green-900">{icon}</span>
      <span className="text-center text-[0.72rem] font-semibold text-green-900">
        {label}
      </span>
    </button>
  );
}
