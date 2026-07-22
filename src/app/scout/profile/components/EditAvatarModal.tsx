// src/app/scout/profile/components/EditAvatarModal.tsx

"use client";

import { useRef, useState } from "react";

import SuccessOverlay from "@/components-general/ui/SuccessOverlay";

interface EditAvatarModalProps {
  currentAvatarUrl?: string | null;

  onSave: (avatarUrl: string) => void;

  onClose: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function EditAvatarModal({
  currentAvatarUrl,
  onSave,
  onClose,
}: EditAvatarModalProps) {

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(
      currentAvatarUrl ?? null
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setSelectedFile(null);

      setError(
        "Only JPG, PNG and WebP images are allowed."
      );

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);

      setError(
        "Image must be smaller than 5 MB."
      );

      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();

    reader.onload = (event) => {
      setPreview(
        event.target?.result as string
      );
    };

    reader.readAsDataURL(file);
  }

  async function uploadAvatar() {
    if (!selectedFile) return;

    setShowConfirm(false);

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append(
        "avatar",
        selectedFile
      );

      const response =
        await fetch(
          "/scout/profile/avatar",
          {
            method: "POST",
            body: formData,
          }
        );

      const result =
        await response.json();

      if (!result.success) {
        setError(
          result.message ??
            "Upload failed."
        );

        return;
      }

      onSave(result.avatarUrl);

      setShowSuccess(true);

      setTimeout(() => {
        onClose();
      }, 1800);

    } catch {
      setError(
        "Unable to upload image."
      );
    } finally {
      setLoading(false);
    }
  }
    async function handleUpload() {
    if (!selectedFile) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("avatar", selectedFile);

      const response = await fetch(
        "/scout/profile/avatar",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!result.success) {
        setError(
          result.message ?? "Upload failed."
        );
        return;
      }

      onSave(result.avatarUrl);

      setShowConfirm(false);

      onClose();
    } catch {
      setError(
        "Unable to upload image."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">

          <h2 className="mb-6 text-center text-2xl font-bold text-green-900">
            Change Avatar
          </h2>

          <div className="mb-6 flex justify-center">

            <div className="h-36 w-36 overflow-hidden rounded-full bg-green-900 shadow">

              {preview ? (
                <img
                  src={preview}
                  alt="Avatar Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">

                  <svg
                    className="h-16 w-16 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>

                </div>
              )}

            </div>

          </div>
                  <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
        />

        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="mb-4 w-full rounded-xl bg-green-900 py-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
        >
          Choose Image
        </button>

        <p className="mb-4 text-center text-xs text-gray-500">
          JPG, PNG or WebP • Maximum 5 MB
        </p>

        {error && (
          <p className="mb-4 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border py-3 font-semibold transition hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedFile || loading}
            onClick={() => setShowConfirm(true)}
            className="flex-1 rounded-xl bg-green-900 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Uploading..."
              : "Use This Avatar"}
          </button>

        </div>

      </div>
    </div>

    {showConfirm && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">

          <h3 className="text-xl font-bold text-green-900">
            Confirm Avatar Change
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Are you sure you want to use this image as your new profile picture?
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowConfirm(false)}
              className="flex-1 rounded-xl border py-3 font-semibold hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleUpload}
              className="flex-1 rounded-xl bg-green-900 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
            >
              {loading
                ? "Uploading..."
                : "Confirm"}
            </button>
          </div>

        </div>
      </div>
    )}
    );
    </>
  )
}