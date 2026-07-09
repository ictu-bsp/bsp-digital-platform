"use client";

import { useRef, useState } from "react";

interface EditAvatarModalProps {
  currentAvatarUrl?: string | null;
  onSave: (file: File) => void;
  onClose: () => void;
}

export default function EditAvatarModal({
  currentAvatarUrl,
  onSave,
  onClose,
}: EditAvatarModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (selectedFile) {
      onSave(selectedFile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-green-900 mb-6">Edit Profile Picture</h2>

        {/* Current Avatar Preview */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Current Image:</p>
          <div className="h-40 w-40 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4 border-2 border-gray-300">
            {currentAvatarUrl ? (
              <img
                src={currentAvatarUrl}
                alt="Current avatar"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <svg
                className="h-20 w-20 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
        </div>

        {/* New Preview */}
        {preview && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">New Image Preview:</p>
            <div className="h-40 w-40 mx-auto rounded-full bg-gray-100 flex items-center justify-center border-2 border-green-400">
              <img
                src={preview}
                alt="New avatar preview"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleFileClick}
          className="w-full mb-4 px-4 py-3 bg-gray-100 text-slate-800 font-semibold rounded-full hover:bg-gray-200 transition flex items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Choose Image
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload new profile image"
        />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-slate-800 font-semibold rounded-full hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedFile}
            className="flex-1 px-4 py-3 bg-green-900 text-white font-semibold rounded-full hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
