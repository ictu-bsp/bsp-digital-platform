interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <div className={className}>
      <h1 className="text-3xl font-bold tracking-tight text-green-900">eScout</h1>
    </div>
  );
}
