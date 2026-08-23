import { useState, useRef, useEffect } from "react";
import { CheckCircleIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

interface SearchableOption {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  loading?: boolean;
  maxVisible?: number;
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

  // Focus input when search mode is activated
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (loading) return;
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

  const baseBoxClass = `w-full h-12 text-left rounded-lg text-lg border transition-colors pl-4 pr-16 focus:outline-none ${
    loading
      ? "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed"
      : filled
      ? "border-green-600 bg-green-50 text-zinc-900 font-medium"
      : "border-zinc-300 bg-white text-zinc-400"
  }`;

  return (
    <div className="relative w-full self-start" ref={containerRef}>
      {isOpen ? (
        /* SEARCH MODE - Single line text input */
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          placeholder={loading ? "Loading..." : placeholder}
          autoComplete="off"
          className={`${baseBoxClass} truncate`}
        />
      ) : (
        /* CLOSED MODE - Truncated single-line button */
        <button
          type="button"
          onClick={handleOpen}
          disabled={loading}
          className={`${baseBoxClass} flex items-center`}
        >
          <span className="truncate block w-full">
            {loading ? "Loading..." : filled ? selectedLabel : placeholder}
          </span>
        </button>
      )}

      {/* Trailing Icons grouped together to guarantee vertical centering */}
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {filled && !loading && (
          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
        )}
        <ChevronDownIcon
          className={`w-5 h-5 text-zinc-500 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Options List */}
      {isOpen && !loading && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 top-full z-30 mt-1 w-full rounded-lg border border-zinc-300 bg-white shadow-lg overflow-y-auto"
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