"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import BadgeTimeline, { MeritBadgeItem } from "./BadgeTimeline";
import { buildInitialBadgeProgress, mergeBadgeProgressWithDefaults } from "@/lib/utils/advancement-progress";

export interface RankItem {
  id: string;
  name: string;
  imageSrc: string;
  badgeType: string;
  unlocked?: boolean;
}

interface RankCarouselProps {
  ranks: RankItem[];
  activeRankId: string;
  sectionLabel?: string;
}

const STORAGE_KEY = "bsp-scout-advancement-progress-v1";

function createDefaultRankProgress(ranks: RankItem[]): Record<string, MeritBadgeItem[]> {
  return Object.fromEntries(
    ranks.map((rank) => [rank.id, buildInitialBadgeProgress(rank.id)])
  );
}

export default function RankCarousel({ ranks, activeRankId, sectionLabel = "Senior Scout Section" }: RankCarouselProps) {
  const [activeRankIdState, setActiveRankIdState] = useState(activeRankId);
  const [rankProgress, setRankProgress] = useState<Record<string, MeritBadgeItem[]>>(() => createDefaultRankProgress(ranks));
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null);

  const defaultRankProgress = useMemo(() => createDefaultRankProgress(ranks), [ranks]);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await fetch("/api/advancement/progress");
        if (response.ok) {
          const parsed = (await response.json()) as Record<string, MeritBadgeItem[]>;
          if (parsed && typeof parsed === "object") {
            setRankProgress(mergeBadgeProgressWithDefaults(defaultRankProgress, parsed));
            return;
          }
        }

        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Record<string, MeritBadgeItem[]>;
          if (parsed && typeof parsed === "object") {
            setRankProgress(mergeBadgeProgressWithDefaults(defaultRankProgress, parsed));
          }
        }
      } catch {
        // Ignore storage issues and keep the default seed data.
      }
    };

    loadProgress();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rankProgress));
    } catch {
      // Ignore storage issues in private browsing mode.
    }
  }, [rankProgress]);

  useEffect(() => {
    const saveProgress = async () => {
      try {
        const payload = mergeBadgeProgressWithDefaults(defaultRankProgress, rankProgress);
        await fetch("/api/advancement/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // Ignore save failures and rely on local persistence as a fallback.
      }
    };

    saveProgress();
  }, [defaultRankProgress, rankProgress]);

  useEffect(() => {
    setActiveRankIdState(activeRankId);
  }, [activeRankId]);

  const activeIndex = useMemo(() => ranks.findIndex((rank) => rank.id === activeRankIdState), [ranks, activeRankIdState]);
  const activeRank = ranks[activeIndex] ?? ranks[0];
  const previousRank = ranks[Math.max(0, activeIndex - 1)];
  const nextRank = ranks[Math.min(ranks.length - 1, activeIndex + 1)];
  const pagination = useMemo(() => ranks.map((_, index) => index), [ranks]);

  const currentBadges = rankProgress[activeRank?.id ?? "explorer"] ?? [];

  useEffect(() => {
    if (!currentBadges.length) {
      return;
    }

    const nextSelected = currentBadges.some((badge) => badge.id === selectedRequirementId)
      ? selectedRequirementId
      : currentBadges[0]?.id ?? null;

    setSelectedRequirementId(nextSelected);
  }, [activeRank?.id, currentBadges, selectedRequirementId]);

  const isRankUnlocked = (index: number) => {
    if (index === 0) {
      return true;
    }

    return (rankProgress[ranks[index - 1]?.id ?? ""] ?? []).every((item) => item.isCompleted);
  };

  useEffect(() => {
    if (activeIndex < 0) {
      setActiveRankIdState(ranks[0]?.id ?? activeRankId);
      return;
    }

    if (!isRankUnlocked(activeIndex)) {
      const firstUnlockedIndex = ranks.findIndex((_, index) => isRankUnlocked(index));
      if (firstUnlockedIndex >= 0) {
        setActiveRankIdState(ranks[firstUnlockedIndex].id);
      }
    }
  }, [activeIndex, ranks, rankProgress]);

  const completedCount = currentBadges.filter((badge) => badge.isCompleted).length;
  const progressPercent = currentBadges.length ? Math.round((completedCount / currentBadges.length) * 100) : 0;

  const handleShift = (direction: "prev" | "next") => {
    if (direction === "prev" && activeIndex > 0) {
      setActiveRankIdState(previousRank.id);
      return;
    }

    if (direction === "next" && activeIndex < ranks.length - 1) {
      const targetIndex = Math.min(activeIndex + 1, ranks.length - 1);
      if (isRankUnlocked(targetIndex)) {
        setActiveRankIdState(ranks[targetIndex].id);
      }
    }
  };

  const handleToggleComplete = (requirementId: string) => {
    if (!activeRank) {
      return;
    }

    setRankProgress((previous) => {
      const next = { ...previous };
      const currentList = [...(next[activeRank.id] ?? [])];
      next[activeRank.id] = currentList.map((item) =>
        item.id === requirementId ? { ...item, isCompleted: !item.isCompleted } : item
      );
      return next;
    });
  };

  const handleUploadEvidence = async (requirementId: string, file: File | null) => {
    if (!file || !activeRank) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("scoutName", "Scout");
    formData.append("requirementName", requirementId);
    formData.append("rankName", activeRank.name);

    try {
      const response = await fetch("/api/advancement/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const payload = (await response.json()) as { url: string; fileName: string };

      setRankProgress((previous) => {
        const next = { ...previous };
        const currentList = [...(next[activeRank.id] ?? [])];
        next[activeRank.id] = currentList.map((item) =>
          item.id === requirementId
            ? {
                ...item,
                uploadedUrl: payload.url,
                uploadedFileName: payload.fileName,
                approvalStatus: "PENDING",
              }
            : item
        );
        return next;
      });
    } catch {
      // Keep the UI responsive even if the upload request fails.
    }
  };

  const handleUpdateNotes = (requirementId: string, note: string) => {
    if (!activeRank) {
      return;
    }

    setRankProgress((previous) => {
      const next = { ...previous };
      const currentList = [...(next[activeRank.id] ?? [])];
      next[activeRank.id] = currentList.map((item) =>
        item.id === requirementId ? { ...item, notes: note } : item
      );
      return next;
    });
  };

  const handleApproveSubmission = (requirementId: string) => {
    if (!activeRank) {
      return;
    }

    setRankProgress((previous) => {
      const next = { ...previous };
      const currentList = [...(next[activeRank.id] ?? [])];
      next[activeRank.id] = currentList.map((item) => {
        if (item.id !== requirementId) {
          return item;
        }

        return {
          ...item,
          approvalStatus: item.approvalStatus === "APPROVED" ? "PENDING" : "APPROVED",
        };
      });
      return next;
    });
  };

  return (
    <section className="rounded-[1.75rem] border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-700">Current rank</p>
          <p className="mt-1 text-lg font-bold text-emerald-950">{activeRank?.name}</p>
          <p className="mt-1 text-sm text-slate-500">{sectionLabel}</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {activeRank?.badgeType}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleShift("prev")}
          disabled={activeIndex === 0}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Show previous rank"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div className="flex-1 rounded-[1.5rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-4 text-center shadow-sm">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-[1.4rem] bg-white p-3 shadow-md">
              <Image src={activeRank.imageSrc} alt={activeRank.name} width={84} height={84} className="h-16 w-16 object-contain" />
            </div>
          </div>

          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-700">Progression</p>
          <p className="mt-1 text-xl font-bold text-emerald-950">{activeRank.name}</p>
          <p className="mt-2 text-sm text-slate-600">
            {isRankUnlocked(activeIndex) ? "This rank is unlocked and ready to review." : "Complete the previous rank to unlock this stage."}
          </p>

          <div className="mt-3 flex items-center justify-center gap-2">
            {isRankUnlocked(activeIndex) ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Unlocked
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="11" width="14" height="8" rx="2" />
                  <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                </svg>
                Locked
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleShift("next")}
          disabled={activeIndex === ranks.length - 1 || !isRankUnlocked(activeIndex + 1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Show next rank"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="mt-4 rounded-[1.25rem] border border-emerald-100 bg-emerald-50/70 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-700">Current progress</p>
            <p className="mt-1 text-sm font-semibold text-emerald-950">{completedCount}/{currentBadges.length} requirements complete</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {progressPercent}%
          </div>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-emerald-100">
          <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-600">This bar tracks how far the scout is from completing the current rank and unlocking the next one.</p>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <div className="min-w-0 flex-1 text-left">
          <p className="font-semibold text-slate-700">Previous</p>
          <p className="truncate">{previousRank?.name ?? "—"}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {pagination.map((_, index) => (
            <span
              key={index}
              className={`h-2.5 rounded-full transition ${index === activeIndex ? "w-6 bg-emerald-700" : "w-2.5 bg-emerald-200"}`}
            />
          ))}
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="font-semibold text-slate-700">Next</p>
          <p className="truncate">{nextRank?.name ?? "—"}</p>
        </div>
      </div>

      <div className="mt-4">
        <BadgeTimeline
          badges={currentBadges}
          selectedBadgeId={selectedRequirementId}
          onSelectBadge={setSelectedRequirementId}
          onToggleComplete={handleToggleComplete}
          onUploadEvidence={handleUploadEvidence}
          onUpdateNotes={handleUpdateNotes}
          onApproveSubmission={handleApproveSubmission}
        />
      </div>
    </section>
  );
}
