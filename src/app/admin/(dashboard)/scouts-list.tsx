// src/app/admin/(dashboard)/scouts-list.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyScoutPayment } from '@/app/actions/scouts';
import { InferSelectModel } from 'drizzle-orm';
import { users } from '@/db/schema';
type ScoutRecord = InferSelectModel<typeof users>;
interface Props {
  initialScouts: ScoutRecord[];
}
// Renders a table of council scouts with action controls for verifying payment status
export function CouncilScoutsTable({ initialScouts }: Props) {
  const router = useRouter();
  const [scouts] = useState<ScoutRecord[]>(initialScouts);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  // Approves and verifies cash payment for a given scout ID, then refreshes page data
  const handleApprove = async (id: string) => {
    setLoadingId(id);
    try {
      const response = await verifyScoutPayment(id, 'paid');
      if (response.success) {
        alert(response.message);
        router.refresh();
      } else {
        alert(response.error);
      }
    } finally {
      setLoadingId(null);
    }
  };
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md p-4 bg-white">
      <table className="w-full text-left text-sm text-gray-500">
        <thead className="bg-green-800 text-xs text-white uppercase font-semibold">
          <tr>
            <th className="px-4 py-3">Scout Name</th>
            <th className="px-4 py-3">Email Address</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {scouts.map((scout) => (
            <tr key={scout.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{scout.lastName}, {scout.firstName}</td>
              <td className="px-4 py-3">{scout.email}</td>
              <td className="px-4 py-3">
                <button type="button" disabled={loadingId === scout.id} onClick={() =>
                  handleApprove(scout.id)} className="bg-green-700 hover:bg-green-600 text-white text-xs
                  font-bold px-3 py-1.5 rounded transition-all shadow-sm disabled:opacity-50">
                  {loadingId === scout.id ? 'Processing...' : 'Confirm Cash'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}