type RegistrationStepperProps = {
  currentStep: number;
  totalSteps: number;
  currentLabel: string;
  splitAfterStep?: number;
};

export default function RegistrationStepper({
  currentStep,
  totalSteps,
  currentLabel,
  splitAfterStep,
}: RegistrationStepperProps) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-y-3 text-sm text-green-800 sm:text-base">
      {Array.from({ length: totalSteps }, (_, index) => index + 1).map((step) => {
        const isActive = step === currentStep;
        const isSplitBoundary = splitAfterStep !== undefined && step === splitAfterStep + 1;

        return (
          <span key={step} className="flex items-center">
            {step > 1 && (
              <span
                className={`inline-flex w-5 justify-center text-center ${
                  isSplitBoundary ? "mx-2 sm:mx-3" : "mx-1.5 sm:mx-2"
                }`}
              >
                |
              </span>
            )}

            <span
              className={
                isActive
                  ? "flex shrink-0 items-center gap-2 rounded-full bg-green-800 px-3 py-1 text-white sm:px-4 sm:py-1.5"
                  : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-green-800 sm:h-8 sm:w-8"
              }
            >
              {isActive ? (
                <>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-green-800 sm:h-6 sm:w-6 sm:text-sm">
                    {step}
                  </span>
                  {currentLabel}
                </>
              ) : (
                step
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
}