interface CarouselIndicatorProps {
  active: boolean;
  onClick: () => void;
}

export function CarouselIndicator({ active, onClick }: CarouselIndicatorProps) {
  return (
    <button
      type="button"
      aria-label="Carousel indicator"
      onClick={onClick}
      className={`h-2.5 w-2.5 rounded-full transition-colors ${
        active ? "bg-green-900" : "bg-gray-300"
      }`}
    />
  );
}
