import { AuthLinks } from "@/app/(public)/components/AuthLinks";
import { BrandLogo } from "@/components-general/BrandLogo";
import { OnboardingCarousel } from "@/app/(public)/components/carousel/OnboardingCarousel";
import { Button } from "@/components-general/ui/Button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white md:flex-row">
      <section className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-8 md:h-screen md:px-12 md:py-12">
        <div className="mb-8 w-full text-center md:absolute md:left-8 md:top-8 md:text-left">
          <BrandLogo />
        </div>

        <div className="w-full max-w-sm md:max-w-md">
          <OnboardingCarousel />
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center px-6 pb-12 pt-8 md:h-screen md:px-16 md:py-16">
        <div className="w-full max-w-md text-center md:text-left">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-green-900 md:text-4xl">
            Membership Registration
          </h2>
          <p className="mb-10 text-base leading-7 text-gray-500 md:mb-12 md:text-lg">
            Register, get verified, and begin your scouting journey. All in one place.
          </p>

          <div className="mt-auto w-full md:mt-12">
            <AuthLinks />
            <Link href="/signup" className="font-bold text-green-900 hover:underline">
              <Button type="button">Sign up</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
