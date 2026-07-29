//src/app/admin/(dashboard)/activities/ActivitiesTable.tsx
"use client";
import { useState } from "react";
import { createActivityAction, updateActivityAction, deleteActivityAction } from "@/app/actions/activities";
type ActivityCategory = "COUNCIL" | "REGIONAL" | "NATIONAL";
type ActivityRow = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  startDate: Date;
  endDate: Date | null;
  registrationDeadline: Date | null;
  location: string;
  category: ActivityCategory;
  councilId: string | null;
  regionId?: string | null;
  maxParticipants: number | null;
  registrationFee: number | null;
  isPublished: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};
type Council = {
  id: string;
  name: string;
};
type Region = {
  id: string;
  name: string;
};
interface Props {
  initialActivities: ActivityRow[];
  councils: Council[];
  regions: Region[];
  scope: { tier: "COUNCIL" | "REGIONAL" | "NATIONAL" | "SUPER"; councilId?: string; regionId?: string };
}
const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  startDate: "",
  endDate: "",
  registrationDeadline: "",
  location: "",
  category: "COUNCIL" as ActivityCategory,
  councilId: "",
  regionId: "",
  maxParticipants: "",
  registrationFee: "",
  isPublished: true,
};
// Render the activities administration table with search, filtering, creation, and inline editing.
export default function ActivitiesTable({ initialActivities, councils, regions, scope }: Props) {
  const scopeLabel =
    scope.tier === "COUNCIL"
      ? councils.find((c) => c.id === scope.councilId)?.name ?? "your council"
      : scope.tier === "REGIONAL"
        ? regions.find((r) => r.id === scope.regionId)?.name ?? "your region"
        : scope.tier === "NATIONAL"
          ? "the national tier (visible to every scout)"
          : null;

  const [activities, setActivities] = useState<ActivityRow[]>(initialActivities);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ActivityCategory | "ALL">("ALL");
  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
  };
  const resetForm = () => setForm(emptyForm);
  const toDatetimeLocalValue = (date: Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const openEditModal = (row: ActivityRow) => {
    setEditingActivityId(row.id);
    setEditForm({
      title: row.title,
      description: row.description,
      imageUrl: row.imageUrl ?? "",
      startDate: toDatetimeLocalValue(row.startDate),
      endDate: toDatetimeLocalValue(row.endDate),
      registrationDeadline: toDatetimeLocalValue(row.registrationDeadline),
      location: row.location,
      category: row.category,
      councilId: row.councilId ?? "",
      regionId: row.regionId ?? "",
      maxParticipants: row.maxParticipants ? String(row.maxParticipants) : "",
      registrationFee: row.registrationFee ? String(row.registrationFee) : "",
      isPublished: row.isPublished,
    });
    setEditModalOpen(true);
  };
  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingActivityId) return;
    if (!editForm.title || !editForm.description || !editForm.location || !editForm.startDate) {
      alert("Title, description, location, and start date are required.");
      return;
    }
    setUpdating(true);
    const result = await updateActivityAction(editingActivityId, {
      title: editForm.title,
      description: editForm.description,
      imageUrl: editForm.imageUrl || null,
      startDate: new Date(editForm.startDate),
      endDate: editForm.endDate ? new Date(editForm.endDate) : null,
      registrationDeadline: editForm.registrationDeadline ? new Date(editForm.registrationDeadline) : null,
      location: editForm.location,
      category: editForm.category,
      councilId: editForm.councilId || null,
      regionId: editForm.regionId || null,
      maxParticipants: editForm.maxParticipants ? Number(editForm.maxParticipants) : null,
      registrationFee: editForm.registrationFee ? Number(editForm.registrationFee) : null,
      isPublished: editForm.isPublished,
    });
    setUpdating(false);
    if (!result.success || !result.data) {
      alert(result.error ?? "Failed to update activity.");
      return;
    }
    setActivities((prev) => prev.map((row) => (row.id === editingActivityId ? (result.data as ActivityRow) : row)));
    setEditModalOpen(false);
    setEditingActivityId(null);
  };
  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title || !form.description || !form.location || !form.startDate) {
      alert("Title, description, location, and start date are required.");
      return;
    }
    setSubmitting(true);
    const result = await createActivityAction({
      title: form.title,
      description: form.description,
      imageUrl: form.imageUrl || null,
      startDate: new Date(form.startDate),
      endDate: form.endDate ? new Date(form.endDate) : null,
      registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline) : null,
      location: form.location,
      category: form.category,
      councilId: form.councilId || null,
      regionId: form.regionId || null,
      maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
      registrationFee: form.registrationFee ? Number(form.registrationFee) : null,
      isPublished: form.isPublished,
    });
    setSubmitting(false);
    if (!result.success || !result.data) {
      alert(result.error ?? "Failed to create activity.");
      return;
    }
    setActivities((prev) => [result.data as ActivityRow, ...prev]);
    resetForm();
    setModalOpen(false);
  };
  const handleTogglePublish = async (id: string, currentlyPublished: boolean) => {
    setPendingId(id);
    const result = await updateActivityAction(id, { isPublished: !currentlyPublished });
    setPendingId(null);
    if (!result.success || !result.data) {
      alert(result.error ?? "Failed to update activity.");
      return;
    }
    setActivities((prev) => prev.map((row) => (row.id === id ? { ...row, isPublished: !currentlyPublished } : row)));
  };
  const handleDelete = async (id: string, title: string) => {
    const confirmed = window.confirm(`Permanently delete "${title}"? This cannot be undone.`);
    if (!confirmed) return;
    setDeletingId(id);
    const result = await deleteActivityAction(id);
    setDeletingId(null);
    if (!result.success) {
      alert(result.error ?? "Failed to delete activity.");
      return;
    }
    setActivities((prev) => prev.filter((row) => row.id !== id));
  };
  const filteredActivities = activities.filter((row) => {
    if (categoryFilter !== "ALL" && row.category !== categoryFilter) return false;
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return row.title.toLowerCase().includes(query) || row.location.toLowerCase().includes(query) || row.category.toLowerCase().includes(query);
  });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, location, or category..." className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-green-800" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as ActivityCategory | "ALL")} className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-green-800">
            <option value="ALL">All Categories</option>
            <option value="COUNCIL">Council</option>
            <option value="REGIONAL">Regional</option>
            <option value="NATIONAL">National</option>
          </select>
        </div>
        <button onClick={() => setModalOpen(true)} className="text-sm font-bold px-4 py-2.5 rounded-lg text-white bg-green-800 hover:bg-green-900 transition-all shadow-sm whitespace-nowrap">
          + Post New Activity
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md p-4 bg-white">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-green-800 text-xs text-white uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Start Date</th>
              <th className="px-4 py-3">Registration Deadline</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredActivities.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  {activities.length === 0 ? "No activities posted yet." : "No activities match your search or filter."}
                </td>
              </tr>
            )}
            {filteredActivities.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{row.title}</td>
                <td className="px-4 py-3">{row.category}</td>
                <td className="px-4 py-3">{row.location}</td>
                <td className="px-4 py-3">{formatDate(row.startDate)}</td>
                <td className="px-4 py-3">{formatDate(row.registrationDeadline)}</td>
                <td className="px-4 py-3">{row.registrationFee ? `₱${row.registrationFee}` : "Free"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${row.isPublished ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"}`}>
                    {row.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <button onClick={() => openEditModal(row)} disabled={pendingId === row.id || deletingId === row.id} className="text-xs font-bold px-3 py-1.5 rounded transition-all shadow-sm text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50">
                      Edit
                    </button>
                    <button onClick={() => handleTogglePublish(row.id, row.isPublished)} disabled={pendingId === row.id || deletingId === row.id} className={`text-xs font-bold px-3 py-1.5 rounded transition-all shadow-sm text-white disabled:opacity-50 ${row.isPublished ? "bg-zinc-600 hover:bg-zinc-700" : "bg-green-700 hover:bg-green-600"}`}>
                      {pendingId === row.id ? "Updating..." : row.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => handleDelete(row.id, row.title)} disabled={deletingId === row.id || pendingId === row.id} className="text-xs font-bold px-3 py-1.5 rounded transition-all shadow-sm text-white bg-zinc-800 hover:bg-black disabled:opacity-50">
                      {deletingId === row.id ? "Deleting..." : "Delete Permanently"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-green-800">Post New Activity</h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="text-zinc-500 hover:text-zinc-800 text-xl leading-none" aria-label="Close">
                ×
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <input placeholder="Title" className="border rounded px-3 py-2 text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <textarea placeholder="Description" className="border rounded px-3 py-2 text-sm" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              <input placeholder="Image URL (optional)" className="border rounded px-3 py-2 text-sm" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              <input placeholder="Location" className="border rounded px-3 py-2 text-sm" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              <div className="flex gap-2">
                <select className="border rounded px-3 py-2 text-sm w-1/2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ActivityCategory })} required>
                  <option value="COUNCIL">Council</option>
                  <option value="REGIONAL">Regional</option>
                  <option value="NATIONAL">National</option>
                </select>
                {scope.tier === "SUPER" ? (
                  <>
                    <select className="border rounded px-3 py-2 text-sm w-1/2" value={form.councilId} onChange={(e) => setForm({ ...form, councilId: e.target.value })}>
                      <option value="">No specific council</option>
                      {councils.map((council) => (
                        <option key={council.id} value={council.id}>{council.name}</option>
                      ))}
                    </select>
                    <select className="border rounded px-3 py-2 text-sm w-1/2" value={form.regionId} onChange={(e) => setForm({ ...form, regionId: e.target.value })}>
                      <option value="">No specific region</option>
                      {regions.map((region) => (
                        <option key={region.id} value={region.id}>{region.name}</option>
                      ))}
                    </select>
                  </>
                ) : null}
              </div>
              {scope.tier === "SUPER" ? (
                <p className="text-xs text-zinc-500 -mt-2">Leave both council and region unset for a national activity. Set one or the other, not both.</p>
              ) : (
                <p className="rounded bg-emerald-50 px-3 py-2 text-xs text-emerald-800 -mt-1">
                  This activity will be posted for: <strong>{scopeLabel}</strong>
                </p>
              )}
              <label className="text-xs font-semibold text-zinc-600">
                Start Date & Time
                <input type="datetime-local" className="border rounded px-3 py-2 text-sm w-full mt-1" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
              </label>
              <label className="text-xs font-semibold text-zinc-600">
                End Date & Time (optional)
                <input type="datetime-local" className="border rounded px-3 py-2 text-sm w-full mt-1" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </label>
              <label className="text-xs font-semibold text-zinc-600">
                Registration Deadline (optional)
                <input type="datetime-local" className="border rounded px-3 py-2 text-sm w-full mt-1" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} />
              </label>
              <label className="text-xs font-semibold text-zinc-600">
                Max Participants (optional)
                <input type="number" min={1} placeholder="Max Participants (optional)" className="border rounded px-3 py-2 text-sm w-full mt-1" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} />
              </label>
              <label className="text-xs font-semibold text-zinc-600">
                Registration Fee in Pesos (optional — leave blank for Free)
                <input type="number" min={0} placeholder="e.g. 150" className="border rounded px-3 py-2 text-sm w-full mt-1" value={form.registrationFee} onChange={(e) => setForm({ ...form, registrationFee: e.target.value })} />
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-800">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4" />
                Publish immediately (visible to scouts)
              </label>
              <button type="submit" disabled={submitting} className="rounded-lg bg-green-800 hover:bg-green-900 text-white font-bold py-2.5 mt-2 disabled:opacity-50">
                {submitting ? "Posting..." : "Post Activity"}
              </button>
            </form>
          </div>
        </div>
      )}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-green-800">Edit Activity</h2>
              <button onClick={() => { setEditModalOpen(false); setEditingActivityId(null); }} className="text-zinc-500 hover:text-zinc-800 text-xl leading-none" aria-label="Close">
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate} className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-zinc-600">
                Title
                <input placeholder="Title" className="border rounded px-3 py-2 text-sm w-full mt-1" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
              </label>
              <label className="text-xs font-semibold text-zinc-600">
                Description
                <textarea placeholder="Description" className="border rounded px-3 py-2 text-sm w-full mt-1" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required />
              </label>
              <label className="text-xs font-semibold text-zinc-600">
                Image URL (optional)
                <input placeholder="Image URL (optional)" className="border rounded px-3 py-2 text-sm w-full mt-1" value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} />
              </label>
              <label className="text-xs font-semibold text-zinc-600">
                Location
                <input placeholder="Location" className="border rounded px-3 py-2 text-sm w-full mt-1" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} required />
              </label>
              <div className="flex gap-2">
                <label className="text-xs font-semibold text-zinc-600 w-1/2">
                  Category
                  <select className="border rounded px-3 py-2 text-sm w-full mt-1" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value as ActivityCategory })} required>
                    <option value="COUNCIL">Council</option>
                    <option value="REGIONAL">Regional</option>
                    <option value="NATIONAL">National</option>
                  </select>
                </label>
                {scope.tier === "SUPER" ? (
                  <label className="text-xs font-semibold text-zinc-600 w-1/2">
                    Council
                    <select className="border rounded px-3 py-2 text-sm w-full mt-1" value={editForm.councilId} onChange={(e) => setEditForm({ ...editForm, councilId: e.target.value })}>
                      <option value="">No specific council</option>
                      {councils.map((council) => (
                        <option key={council.id} value={council.id}>{council.name}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div className="w-1/2 rounded bg-emerald-50 px-3 py-2 text-xs text-emerald-800 self-end">
                    Scoped to: <strong>{scopeLabel}</strong>
                  </div>
                )}
              </div>
              {scope.tier === "SUPER" && (
              <div className="flex gap-2">
                <label className="text-xs font-semibold text-zinc-600 w-1/2">
                  Region
                  <select className="border rounded px-3 py-2 text-sm w-full mt-1" value={editForm.regionId} onChange={(e) => setEditForm({ ...editForm, regionId: e.target.value })}>
                    <option value="">No specific region</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>{region.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              )}
              <label className="text-xs font-semibold text-zinc-600">
                Start Date & Time
                <input type="datetime-local" className="border rounded px-3 py-2 text-sm w-full mt-1" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} required />
              </label>
              <label className="text-xs font-semibold text-zinc-600">
                End Date & Time (optional)
                <input type="datetime-local" className="border rounded px-3 py-2 text-sm w-full mt-1" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} />
              </label>
              <label className="text-xs font-semibold text-zinc-600">
                Registration Deadline (optional)
                <input type="datetime-local" className="border rounded px-3 py-2 text-sm w-full mt-1" value={editForm.registrationDeadline} onChange={(e) => setEditForm({ ...editForm, registrationDeadline: e.target.value })} />
              </label>
              <label className="text-xs font-semibold text-zinc-600">
                Max Participants (optional)
                <input type="number" min={1} placeholder="Max Participants (optional)" className="border rounded px-3 py-2 text-sm w-full mt-1" value={editForm.maxParticipants} onChange={(e) => setEditForm({ ...editForm, maxParticipants: e.target.value })} />
              </label>
              <label className="text-xs font-semibold text-zinc-600">
                Registration Fee in Pesos (optional — leave blank for Free)
                <input type="number" min={0} placeholder="e.g. 150" className="border rounded px-3 py-2 text-sm w-full mt-1" value={editForm.registrationFee} onChange={(e) => setEditForm({ ...editForm, registrationFee: e.target.value })} />
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-800">
                <input type="checkbox" checked={editForm.isPublished} onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })} className="w-4 h-4" />
                Published (visible to scouts)
              </label>
              <button type="submit" disabled={updating} className="rounded-lg bg-green-800 hover:bg-green-900 text-white font-bold py-2.5 mt-2 disabled:opacity-50">
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}