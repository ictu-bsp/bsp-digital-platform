// src/app/scout/activities/[id]/join/ConfirmJoinForm.tsx

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SuccessOverlay from "@/components-general/ui/SuccessOverlay";
import { joinActivityAction } from "@/app/actions/activities";

interface ConfirmJoinFormProps {
  activityId: string;
  activityTitle: string;
}

export default function ConfirmJoinForm({
  activityId,
  activityTitle,
}: ConfirmJoinFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState(`/scout/activities/${activityId}`);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsPending(true);

    try {
      const result = await joinActivityAction(activityId);

      if (result.success) {
        if (result.redirectTo) {
          setTargetUrl(result.redirectTo);
        }
        setShowSuccess(true);
      } else {
        setErrorMsg(result.error || "Failed to join activity.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  const handleComplete = () => {
    // Solution B: Perform route transition strictly inside startTransition
    // AFTER the overlay duration completes, keeping the overlay stable.
    startTransition(() => {
      router.push(targetUrl);
      router.refresh();
    });
  };

  return (
    <>
      {errorMsg && (
        <div className="mt-3 rounded-xl bg-red-100 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleJoin} className="mt-4">
        <button
          type="submit"
          disabled={isPending || showSuccess}
          className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Joining..." : showSuccess ? "Joined!" : "Confirm Join"}
        </button>
      </form>

      <SuccessOverlay
        open={showSuccess}
        title="Joined Activity!"
        subtitle={`You are now registered for ${activityTitle}`}
        duration={3000}
        onComplete={handleComplete}
      />
    </>
  );
}