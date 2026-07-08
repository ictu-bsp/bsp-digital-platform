'use client';

import { useState } from 'react';
import type { JoinButtonProps } from '@/types/activity-details';

export default function JoinButton({ activityId }: JoinButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 800));
    setLoading(false);
    console.info(`Joined activity ${activityId}`);
  };

  return (
    <button
      type="button"
      onClick={handleJoin}
      className="w-full rounded-2xl bg-green-900 px-5 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={loading}
    >
      {loading ? 'Joining...' : 'Join'}
    </button>
  );
}
