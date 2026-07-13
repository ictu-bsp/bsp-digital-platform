import Image from "next/image";
interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <div className={className}>
      <Image
                src="/escout-logo.svg"
                alt="eScout Logo"
                width={125}
                height={125}
                className="h-auto w-[115px] object-contain"
              />
    </div>
  );
}
