//src/app/admin/officers/[id]/edit/page.tsx

"use client";

import { useParams } from "next/navigation";

export default function EditOfficerPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-800">Edit Officer Account</h1>
      <p className="text-zinc-600 mt-2">
        Editing officer ID: {id} — form coming soon.
      </p>
    </div>
  );
}