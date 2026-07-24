"use client";
// src/app/scout/membership/membership-registration/components/AddressSelect.tsx
// Searchable, cascading Region -> Province -> City/Municipality -> Barangay
// picker backed by the PSGC API (proxied through /api/psgc/*), plus a
// free-text Street/House No. field. Used on the Personal Info step.

import { useEffect, useRef, useState } from "react";

type PsgcItem = { code: string; name: string };

export type AddressParts = {
  region: string;
  province: string;
  cityMunicipality: string;
  barangay: string;
  streetAddress: string;
};

function SearchableSelect({
  label,
  value,
  options,
  onSelect,
  disabled,
  loading,
}: {
  label: string;
  value: string;
  options: PsgcItem[];
  onSelect: (item: PsgcItem) => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered =
    query === ""
      ? options
      : options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        placeholder={disabled ? label : `Search ${label}`}
        disabled={disabled}
        value={open ? query : value}
        onFocus={() => {
          if (disabled) return;
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        className={`w-full rounded-lg py-3 px-4 text-lg border transition-colors ${
          disabled
            ? "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed"
            : value
            ? "border-green-600 bg-green-50 text-zinc-900"
            : "border-zinc-300 bg-white text-zinc-400"
        }`}
      />
      {loading && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
          Loading...
        </span>
      )}
      {open && !disabled && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-zinc-300 bg-white shadow-lg">
          {filtered.map((item) => (
            <li
              key={item.code}
              onClick={() => {
                onSelect(item);
                setQuery("");
                setOpen(false);
              }}
              className="px-4 py-2 text-base text-zinc-900 hover:bg-green-50 cursor-pointer"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
      {open && !disabled && query !== "" && filtered.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-zinc-300 bg-white shadow-lg px-4 py-2 text-sm text-zinc-400">
          No matches
        </div>
      )}
    </div>
  );
}

export default function AddressSelect({
  value,
  onChange,
}: {
  value: AddressParts;
  onChange: (parts: AddressParts) => void;
}) {
  const [regions, setRegions] = useState<PsgcItem[]>([]);
  const [provinces, setProvinces] = useState<PsgcItem[]>([]);
  const [cities, setCities] = useState<PsgcItem[]>([]);
  const [barangays, setBarangays] = useState<PsgcItem[]>([]);

  const [regionCode, setRegionCode] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [hasProvinces, setHasProvinces] = useState(true);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  useEffect(() => {
    fetch("/api/psgc/regions")
      .then((res) => res.json())
      .then((data: PsgcItem[]) =>
        setRegions([...data].sort((a, b) => a.name.localeCompare(b.name)))
      )
      .catch((err) => console.error("Failed to load PSGC regions:", err));
  }, []);

  const handleSelectRegion = async (item: PsgcItem) => {
    setRegionCode(item.code);
    setProvinceCode("");
    setCityCode("");
    setProvinces([]);
    setCities([]);
    setBarangays([]);
    onChange({ ...value, region: item.name, province: "", cityMunicipality: "", barangay: "" });

    setLoadingProvinces(true);
    try {
      const provRes = await fetch(`/api/psgc/regions/${item.code}/provinces`);
      const provData: PsgcItem[] = await provRes.json();

      if (Array.isArray(provData) && provData.length > 0) {
        setHasProvinces(true);
        setProvinces([...provData].sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        // Regions like NCR have no provinces -- cities sit directly under the region.
        setHasProvinces(false);
        setLoadingCities(true);
        const cityRes = await fetch(`/api/psgc/regions/${item.code}/cities-municipalities`);
        const cityData: PsgcItem[] = await cityRes.json();
        setCities([...cityData].sort((a, b) => a.name.localeCompare(b.name)));
        setLoadingCities(false);
      }
    } catch (err) {
      console.error("Failed to load PSGC provinces/cities:", err);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const handleSelectProvince = async (item: PsgcItem) => {
    setProvinceCode(item.code);
    setCityCode("");
    setCities([]);
    setBarangays([]);
    onChange({ ...value, province: item.name, cityMunicipality: "", barangay: "" });

    setLoadingCities(true);
    try {
      const res = await fetch(`/api/psgc/provinces/${item.code}/cities-municipalities`);
      const data: PsgcItem[] = await res.json();
      setCities([...data].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error("Failed to load PSGC cities:", err);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleSelectCity = async (item: PsgcItem) => {
    setCityCode(item.code);
    setBarangays([]);
    onChange({ ...value, cityMunicipality: item.name, barangay: "" });

    setLoadingBarangays(true);
    try {
      const res = await fetch(`/api/psgc/cities-municipalities/${item.code}/barangays`);
      const data: PsgcItem[] = await res.json();
      setBarangays([...data].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error("Failed to load PSGC barangays:", err);
    } finally {
      setLoadingBarangays(false);
    }
  };

  const handleSelectBarangay = (item: PsgcItem) => {
    onChange({ ...value, barangay: item.name });
  };

  return (
    <div className="flex flex-col gap-3">
      <SearchableSelect
        label="Region"
        value={value.region}
        options={regions}
        onSelect={handleSelectRegion}
      />

      {hasProvinces && (
        <SearchableSelect
          label="Province"
          value={value.province}
          options={provinces}
          onSelect={handleSelectProvince}
          disabled={!regionCode}
          loading={loadingProvinces}
        />
      )}

      <SearchableSelect
        label="City / Municipality"
        value={value.cityMunicipality}
        options={cities}
        onSelect={handleSelectCity}
        disabled={hasProvinces ? !provinceCode : !regionCode}
        loading={loadingCities}
      />

      <SearchableSelect
        label="Barangay"
        value={value.barangay}
        options={barangays}
        onSelect={handleSelectBarangay}
        disabled={!cityCode}
        loading={loadingBarangays}
      />

      <input
        placeholder="Street / House No. / Subdivision"
        className={`w-full rounded-lg py-3 px-4 text-lg border transition-colors ${
          value.streetAddress !== ""
            ? "border-green-600 bg-green-50 text-zinc-900"
            : "border-zinc-300 bg-white text-zinc-400"
        }`}
        value={value.streetAddress}
        onChange={(e) => onChange({ ...value, streetAddress: e.target.value })}
      />
    </div>
  );
}