"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircleIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

export interface SearchableOption {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string; // selected option's id, "" if none selected
  onChange: (id: string) => void;
  placeholder: string;
  loading?: boolean;
  maxVisible?: number; // how many rows show before the list scrolls
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  loading = false,
  maxVisible = 5,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.id === value)?.label ?? "";
  const filled = value !== "";

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  // Close the dropdown on outside click.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // When we switch into "open/search" mode, the <input> only exists in the
  // DOM at that point (see render below) — focus it right after it mounts.
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (loading) return;
    // Start each search fresh so the full option list is visible immediately.
    setQuery("");
    setIsOpen(true);
  };

  const handleSelect = (option: SearchableOption) => {
    onChange(option.id);
    setQuery("");
    setIsOpen(false);
  };

  // ~44px per row, so maxVisible rows show before it becomes scrollable.
  const listMaxHeight = maxVisible * 44;

  const boxClass = `w-full rounded-lg py-3 text-lg border transition-colors pl-4 pr-16 text-left ${
    loading
      ? "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed"
      : filled
      ? "border-green-600 bg-green-50 text-zinc-900"
      : "border-zinc-300 bg-white text-zinc-400"
  }`;

  return (
    <div className="relative" ref={containerRef}>
      {isOpen ? (
        // SEARCH MODE — a real single-line input for typing a filter query.
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          placeholder={loading ? "Loading..." : placeholder}
          autoComplete="off"
          className={boxClass}
        />
      ) : (
        // CLOSED MODE — a button, not an input, so long labels can wrap
        // onto multiple lines instead of being clipped/cut off.
        <button
          type="button"
          onClick={handleOpen}
          disabled={loading}
          className={`${boxClass} whitespace-normal break-words leading-snug min-h-[52px] flex items-center`}
        >
          {loading ? "Loading..." : filled ? selectedLabel : placeholder}
        </button>
      )}

      {filled && !loading && (
        <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />
      )}
      <ChevronDownIcon className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />

      {isOpen && !loading && (
        <div
          // Prevents the input from blurring when an option is clicked,
          // so handleSelect fires cleanly without a race against onBlur.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute z-20 mt-1 w-full rounded-lg border border-zinc-300 bg-white shadow-lg overflow-y-auto"
          style={{ maxHeight: `${listMaxHeight}px` }}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-2.5 text-base text-zinc-400">
              No matches found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-2.5 text-base whitespace-normal break-words leading-snug hover:bg-green-50 ${
                  option.id === value
                    ? "bg-green-100 text-green-900 font-medium"
                    : "text-zinc-900"
                }`}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}