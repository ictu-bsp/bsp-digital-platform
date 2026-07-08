interface OnboardingSlideProps {
  title: string;
  description: string;
  badge: string;
  accentClassName: string;
  icon?: React.ReactNode; 
}

export function OnboardingSlide({
  title,
  description,
  badge,
  accentClassName,
  icon,
}: OnboardingSlideProps) {
  return (
    <div
      className={`relative flex h-64 w-full max-w-sm flex-col rounded-[2rem] border-4 border-green-900 bg-gradient-to-br p-6 shadow-sm md:h-80 md:max-w-md ${accentClassName}`}
    >
      <span className="w-fit rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-green-900">
        {badge}
      </span>

      {icon && (
        <div className="absolute left-1/2 top-[4.1rem] flex w-24 -translate-x-1/2 items-center justify-center rounded-lg bg-white/70 p-[2px] shadow-[0_0_0_0.5px_rgba(255,255,255,0.35)] sm:w-28 md:top-[4.4rem] md:w-28">
          {icon}
        </div>
      )}

      <div className="mt-28 flex flex-1 flex-col items-center justify-center">
        <h3 className="text-center text-xl font-semibold text-green-900">{title}</h3>
        <p className="mt-3 text-center text-sm leading-6 text-gray-600">{description}</p>
      </div>
    </div>
  );
}
