"use client";
// src/app/admin/(dashboard)/announcements/AnnouncementsTable.tsx

import { useState } from "react";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
} from "@/app/actions/announcements";

type Council = { id: string; name: string };
type Region = { id: string; name: string };
type Scope = {
  tier: "COUNCIL" | "REGIONAL" | "NATIONAL" | "SUPER";
  councilId?: string;
  regionId?: string;
};

type AnnouncementRow = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  visibility: "PUBLIC" | "SCOUTS" | "COUNCIL" | "REGIONAL";
  isPinned: boolean;
  createdAt: Date;
  author: { firstName: string; lastName: string } | null;
  council: { name: string } | null;
  region: { name: string } | null;
};

interface Props {
  initialAnnouncements: AnnouncementRow[];
  councils: Council[];
  regions: Region[];
  scope: Scope;
}

const emptyForm = {
  title: "",
  content: "",
  imageUrl: "",
  visibility: "PUBLIC" as "PUBLIC" | "SCOUTS" | "COUNCIL" | "REGIONAL",
  councilId: "",
  regionId: "",
  isPinned: false,
};

function scopeLabel(scope: Scope, councils: Council[], regions: Region[]): string {
  if (scope.tier === "COUNCIL") return councils.find((c) => c.id === scope.councilId)?.name ?? "your council";
  if (scope.tier === "REGIONAL") return regions.find((r) => r.id === scope.regionId)?.name ?? "your region";
  if (scope.tier === "NATIONAL") return "the national tier (PUBLIC or SCOUTS)";
  return "any tier";
}

export default function AnnouncementsTable({ initialAnnouncements, councils, regions, scope }: Props) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const label = scopeLabel(scope, councils, regions);
  const isSuper = scope.tier === "SUPER";
  const isNational = scope.tier === "NATIONAL";

  const openCreate = () => {
    setForm(emptyForm);
    setError("");
    setShowCreate(true);
  };

  const openEdit = (row: AnnouncementRow) => {
    setEditingId(row.id);
    setForm({
      title: row.title,
      content: row.content,
      imageUrl: row.imageUrl ?? "",
      visibility: row.visibility,
      councilId: "",
      regionId: "",
      isPinned: row.isPinned,
    });
    setError("");
  };

  const closeModals = () => {
    setShowCreate(false);
    setEditingId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await createAnnouncementAction({
      title: form.title,
      content: form.content,
      imageUrl: form.imageUrl || null,
      visibility: form.visibility,
      councilId: form.councilId || null,
      regionId: form.regionId || null,
      isPinned: form.isPinned,
    });

    setSubmitting(false);

    if (!result.success || !result.data) {
      setError(result.error ?? "Failed to create announcement.");
      return;
    }

    setAnnouncements((prev) => [
      { ...result.data, author: null, council: null, region: null } as AnnouncementRow,
      ...prev,
    ]);
    closeModals();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    setError("");

    const result = await updateAnnouncementAction(editingId, {
      title: form.title,
      content: form.content,
      imageUrl: form.imageUrl || null,
      visibility: form.visibility,
      councilId: form.councilId || null,
      regionId: form.regionId || null,
      isPinned: form.isPinned,
    });

    setSubmitting(false);

    if (!result.success || !result.data) {
      setError(result.error ?? "Failed to update announcement.");
      return;
    }

    setAnnouncements((prev) =>
      prev.map((a) => (a.id === editingId ? { ...a, ...result.data } as AnnouncementRow : a))
    );
    closeModals();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    const result = await deleteAnnouncementAction(id);
    if (result.success) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const renderVisibilityFields = () => (
    <>
      {(isSuper || isNational) && (
        <select
          className="border rounded px-3 py-2 text-sm w-full"
          value={form.visibility}
          onChange={(e) => setForm({ ...form, visibility: e.target.value as typeof form.visibility })}
        >
          <option value="PUBLIC">Public (everyone, incl. visitors)</option>
          <option value="SCOUTS">Scouts (any scout/admin anywhere)</option>
          {isSuper && <option value="COUNCIL">Council-specific</option>}
          {isSuper && <option value="REGIONAL">Region-specific</option>}
        </select>
      )}

      {isSuper && form.visibility === "COUNCIL" && (
        <select
          className="border rounded px-3 py-2 text-sm w-full"
          value={form.councilId}
          onChange={(e) => setForm({ ...form, councilId: e.target.value })}
          required
        >
          <option value="" disabled>Select a council</option>
          {councils.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}

      {isSuper && form.visibility === "REGIONAL" && (
        <select
          className="border rounded px-3 py-2 text-sm w-full"
          value={form.regionId}
          onChange={(e) => setForm({ ...form, regionId: e.target.value })}
          required
        >
          <option value="" disabled>Select a region</option>
          {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      )}

      {!isSuper && !isNational && (
        <p className="rounded bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          This announcement will be posted for: <strong>{label}</strong>
        </p>
      )}
    </>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-zinc-500">
          {announcements.length} announcement{announcements.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-green-800 hover:bg-green-900 text-white text-sm font-medium py-2 px-4"
        >
          + New Announcement
        </button>
      </div>

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <p className="text-sm text-zinc-500">No announcements yet.</p>
        ) : (
          announcements.map((row) => (
            <div key={row.id} className="border rounded-xl p-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-zinc-900">{row.title}</p>
                  {row.isPinned && (
                    <span className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">Pinned</span>
                  )}
                  <span className="text-xs bg-zinc-100 text-zinc-700 rounded-full px-2 py-0.5">
                    {row.visibility}
                    {row.council?.name ? ` · ${row.council.name}` : ""}
                    {row.region?.name ? ` · ${row.region.name}` : ""}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 mt-1 line-clamp-2">{row.content}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => openEdit(row)} className="text-sm text-blue-700 hover:underline">Edit</button>
                <button type="button" onClick={() => handleDelete(row.id)} className="text-sm text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {(showCreate || editingId) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={editingId ? handleUpdate : handleCreate}
            className="bg-white rounded-2xl p-6 w-full max-w-lg flex flex-col gap-3 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-bold text-green-800">
              {editingId ? "Edit Announcement" : "New Announcement"}
            </h2>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <input
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Content"
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
            <input
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Image URL (optional)"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />

            {renderVisibilityFields()}

            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
              />
              Pin to top
            </label>

            <div className="flex gap-2 mt-2">
              <button type="button" onClick={closeModals} className="flex-1 rounded border border-zinc-300 py-2.5 text-zinc-700">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-green-800 hover:bg-green-900 text-white font-bold py-2.5 disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingId ? "Save Changes" : "Post Announcement"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
