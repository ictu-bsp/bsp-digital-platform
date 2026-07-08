'use client';

import type { FilterTabsProps } from '@/types/activities';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'national', label: 'National' },
  { value: 'regional', label: 'Regional' },
  { value: 'council', label: 'Council' },
];

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onFilterChange(filter.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
