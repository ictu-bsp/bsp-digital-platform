// src/app/scout/activities/[id]/leave/ConfirmLeaveForm.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SuccessOverlay from "@/components-general/ui/SuccessOverlay";
import { leaveActivityAction } from "@/app/actions/activities";
interface ConfirmLeaveFormProps {
  activityId: string;
  activityTitle: string;
}
// Handles activity leave confirmation logic and renders unregister action controls
export default function ConfirmLeaveForm({ activityId, activityTitle }: ConfirmLeaveFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState(`/scout/activities/${activityId}`);
  // Submits the activity unregistration request and displays the success overlay
  const handleLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsPending(true);
    try {
      const result = await leaveActivityAction(activityId);
      if (result.success) {
        if (result.redirectTo) setTargetUrl(result.redirectTo);
        setShowSuccess(true);
      } else setErrorMsg(result.error || "Failed to leave activity.");
    } catch {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };
  // Navigates to the activity page after the success overlay completes
  const handleComplete = () => {
    startTransition(() => {
      router.push(targetUrl);
      router.refresh();
    });
  };
  return (
    <>
      {errorMsg && <div className="mt-3 rounded-xl bg-red-100 p-3 text-sm text-red-700">{errorMsg}</div>}
      <form onSubmit={handleLeave} className="mt-5">
        <button type="submit" disabled={isPending || showSuccess}
          className="w-full rounded-xl bg-red-600 px-4 py-3 text-base font-semibold text-white
          transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isPending ? "Leaving..." : showSuccess ? "Left Activity!" : "Confirm Leave"}
        </button>
      </form>
      <SuccessOverlay open={showSuccess}
        title="Left Activity"
        subtitle={`You have unregistered from ${activityTitle}`}
        duration={3000}
        onComplete={handleComplete}
      />
    </>
  );
}