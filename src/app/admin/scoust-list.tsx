'use client';

import { useState } from 'react';
import { verifyScoutPayment } from '@/app/actions/scouts';
import { InferSelectModel } from 'drizzle-orm';
import { users } from '@/db/schema';

// Industry standard: extract the strict database row types automatically
type ScoutRecord = InferSelectModel<typeof users>;

interface Props {
  initialScouts: ScoutRecord[];
}

export function CouncilScoutsTable({ initialScouts }: Props) {
  const [scouts, setScouts] = useState<ScoutRecord[]>(initialScouts);

  const handleApprove = async (id: string) => {
    const response = await verifyScoutPayment(id, 'MANUAL_CASH_CONFIRM');
    
    if (response.success && response.data) {
      alert(response.message);
      setScouts(scouts.map(s => s.id === id ? response.data! : s));
    } else {
      alert('Error updating row data.');
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md p-4 bg-white">
      <table className="w-full text-left text-sm text-gray-500">
        <thead className="bg-green-800 text-xs text-white uppercase font-semibold">
          <tr>
            <th className="px-4 py-3">Scout Name</th>
            <th className="px-4 py-3">Email Address</th>
            <th className="px-4 py-3">Payment Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {scouts.map((scout) => (
            <tr key={scout.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{scout.lastName}, {scout.firstName}</td>
              <td className="px-4 py-3">{scout.email}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  scout.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {scout.paymentStatus}
                </span>
              </td>
              <td className="px-4 py-3">
                {scout.paymentStatus !== 'paid' && (
                  <button 
                    onClick={() => handleApprove(scout.id)}
                    className="bg-green-700 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded transition-all shadow-sm"
                  >
                    Confirm Cash
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}