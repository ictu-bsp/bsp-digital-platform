"use client";
// src/app/scout/membership/PendingStatusPoller.tsx
// Polls /scout/api/application-status every few seconds while the
// scout's application is PENDING. The moment the status changes,
// it calls router.refresh() so the server component (page.tsx)
// re-fetches fresh data and its existing APPROVED redirect fires.
// Renders nothing visible — this is a background watcher only.

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 5000;

export default function PendingStatusPoller() {
  const router = useRouter();
  const hasStoppedRef = useRef(false);

  useEffect(() => {
    hasStoppedRef.current = false;

    const intervalId = setInterval(async () => {
      if (hasStoppedRef.current) return;

      try {
        const response = await fetch("/scout/api/application-status", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data.status && data.status !== "PENDING") {
          hasStoppedRef.current = true;
          clearInterval(intervalId);
          router.refresh();
        }
      } catch {
        // Silently ignore a failed poll — it'll just try again on
        // the next interval tick.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      hasStoppedRef.current = true;
      clearInterval(intervalId);
    };
  }, [router]);

  return null;
}