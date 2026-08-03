import BadgeCard from "./BadgeCard";

export interface MeritBadgeItem {
  id: string;
  name: string;
  isCompleted: boolean;
  note?: string;
  description?: string;
  notes?: string;
  uploadedFileName?: string | null;
  uploadedUrl?: string | null;
  approvalStatus?: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
}

interface BadgeTimelineProps {
  badges: MeritBadgeItem[];
  selectedBadgeId: string | null;
  onSelectBadge: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onUploadEvidence: (id: string, file: File | null) => void;
  onUpdateNotes: (id: string, note: string) => void;
  onApproveSubmission: (id: string) => void;
}

export default function BadgeTimeline({
  badges,
  selectedBadgeId,
  onSelectBadge,
  onToggleComplete,
  onUploadEvidence,
  onUpdateNotes,
  onApproveSubmission,
}: BadgeTimelineProps) {
  const selectedBadge = badges.find((badge) => badge.id === selectedBadgeId) ?? null;

  return (
    <section className="rounded-[1.75rem] border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-700">Required achievements</p>
          <h3 className="mt-1 text-lg font-bold text-emerald-950">Progress checklist</h3>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {badges.filter((badge) => badge.isCompleted).length}/{badges.length}
        </div>
      </div>

      <div className="space-y-3">
        {badges.map((badge, index) => {
          const isCompleted = badge.isCompleted;
          const isLast = index === badges.length - 1;

          return (
            <div key={badge.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${isCompleted ? "border-emerald-700 bg-emerald-700" : "border-slate-300 bg-white"}`}>
                  {isCompleted ? (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12.5 9.5 17 19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </div>
                {!isLast ? <div className={`mt-1 h-10 w-[2px] ${isCompleted ? "bg-emerald-700" : "border-l border-dashed border-slate-300"}`} /> : null}
              </div>

              <div className="flex-1">
                <BadgeCard
                  label={badge.name}
                  isCompleted={isCompleted}
                  subtitle={badge.note}
                  hasUpload={Boolean(badge.uploadedUrl)}
                  isSelected={selectedBadgeId === badge.id}
                  onClick={() => onSelectBadge(badge.id)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {selectedBadge ? (
        <div className="mt-4 rounded-[1.25rem] border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-700">Requirement details</p>
              <p className="mt-1 text-sm font-semibold text-emerald-950">{selectedBadge.name}</p>
            </div>
            <button
              type="button"
              onClick={() => onToggleComplete(selectedBadge.id)}
              disabled={!selectedBadge.uploadedUrl || selectedBadge.approvalStatus !== "APPROVED"}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-60 ${
                selectedBadge.isCompleted ? "bg-white text-emerald-700" : "bg-emerald-700 text-white"
              }`}
            >
              {selectedBadge.isCompleted ? "Mark pending" : "Mark complete"}
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-600">{selectedBadge.description ?? "Upload proof of completion so your unit leader can review it later."}</p>

          <div className="mt-4 space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Upload proof
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={(event) => onUploadEvidence(selectedBadge.id, event.target.files?.[0] ?? null)}
                className="mt-2 block w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-600"
              />
            </label>

            <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-700">Approval status</span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                selectedBadge.approvalStatus === "APPROVED"
                  ? "bg-emerald-100 text-emerald-700"
                  : selectedBadge.approvalStatus === "PENDING"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
              }`}>
                {selectedBadge.approvalStatus === "APPROVED"
                  ? "Approved"
                  : selectedBadge.approvalStatus === "PENDING"
                    ? "Pending"
                    : "Awaiting upload"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onApproveSubmission(selectedBadge.id)}
              disabled={!selectedBadge.uploadedUrl || selectedBadge.approvalStatus === "APPROVED" || selectedBadge.approvalStatus === "PENDING"}
              className="rounded-full bg-emerald-700 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {selectedBadge.approvalStatus === "APPROVED" ? "Approved" : selectedBadge.approvalStatus === "PENDING" ? "Pending review" : "Approve submission"}
            </button>

            <label className="block text-sm font-semibold text-slate-700">
              Notes
              <textarea
                value={selectedBadge.notes ?? ""}
                onChange={(event) => onUpdateNotes(selectedBadge.id, event.target.value)}
                rows={3}
                className="mt-2 block w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-600"
                placeholder="Record what you did, where it happened, or what you learned."
              />
            </label>

            {selectedBadge.uploadedUrl ? (
              <div className="rounded-xl border border-emerald-200 bg-white px-3 py-3 text-sm text-slate-700">
                <p className="font-semibold text-emerald-800">Saved evidence</p>
                <a href={selectedBadge.uploadedUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-sm font-medium text-emerald-700 underline">
                  {selectedBadge.uploadedFileName ?? "Open attachment"}
                </a>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No evidence saved yet. This will stay in the app and be ready for your unit leader once approval is granted.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
