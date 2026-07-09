'use client';

import { useState } from 'react';

interface ActivityLogoEditorProps {
  initialLogoUrl: string;
  onSave: (logoUrl: string) => void;
}

export default function ActivityLogoEditor({ initialLogoUrl, onSave }: ActivityLogoEditorProps) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Admin logo
        </p>
        <button
          type="button"
          onClick={() => setIsEditing((value) => !value)}
          className="text-sm font-semibold text-green-700"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <input
            value={logoUrl}
            onChange={(event) => setLogoUrl(event.target.value)}
            placeholder="Enter image URL"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0"
          />
          <button
            type="button"
            onClick={() => {
              onSave(logoUrl);
              setIsEditing(false);
            }}
            className="rounded-xl bg-green-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Save logo
          </button>
        </div>
      ) : null}
    </div>
  );
}
