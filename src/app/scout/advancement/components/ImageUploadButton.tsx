"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setSelectedFile(null);
      setMessage("Only JPG, PNG, and WebP images are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setMessage("Image must be smaller than 5 MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage(`Selected: ${file.name}`);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    setMessage("Image selected locally. Nothing is being uploaded yet.");
  };

  return (
    <div className="rounded-[1.5rem] border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Upload className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">Upload a progress image</p>
          <p className="mt-1 text-xs text-slate-500">Add a photo of your completed achievement or rank milestone.</p>
        </div>
      </div>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700"
        >
          Choose Image
        </button>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile}
          className="flex-1 rounded-2xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Upload
        </button>
      </div>

      {previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50">
          <img src={previewUrl} alt="Selected advancement preview" className="h-48 w-full object-cover" />
        </div>
      ) : null}

      {message ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {message.includes("Ready") ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
          <span>{message}</span>
        </div>
      ) : null}
    </div>
  );
}
