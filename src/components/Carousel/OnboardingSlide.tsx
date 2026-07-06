interface OnboardingSlideProps {
  title: string;
  description: string;
  badge: string;
  accentClassName: string;
}

export function OnboardingSlide({
  title,
  description,
  badge,
  accentClassName,
}: OnboardingSlideProps) {
  return (
    <div
      className={`flex h-64 w-full max-w-sm flex-col justify-between rounded-[2rem] border-4 border-green-900 bg-gradient-to-br p-6 shadow-sm md:h-80 md:max-w-md ${accentClassName}`}
    >
      <span className="w-fit rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-green-900">
        {badge}
      </span>
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-green-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
