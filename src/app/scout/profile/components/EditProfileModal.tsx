// src/app/scout/profile/components/EditProfileModal.tsx

"use client";

import { useState } from "react";

import { updateProfileAction } from "@/app/actions/profile";
import EditAvatarModal from "./EditAvatarModal";

interface EditProfileModalProps {
  user: {
    firstName: string;
    middleName: string | null;
    lastName: string;
    suffix: string |null;
    email: string;
    birthdate: Date;
    gender: string;
    avatarUrl?: string | null;
  };

  onClose: () => void;

  onSave?: (profile: {
    firstName: string;
    middleName: string | null;
    lastName: string;
    suffix: string | null;
    birthdate: Date;
    gender: string;
    avatarUrl?: string | null;
  }) => void;
}

export default function EditProfileModal({
  user,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    middleName: user.middleName ?? "",
    lastName: user.lastName,
    suffix: user.suffix ?? "",
    birthdate: new Date(user.birthdate)
      .toISOString()
      .split("T")[0],
    gender: user.gender,
  });

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(
      user.avatarUrl ?? null
    );

  const [showAvatarModal, setShowAvatarModal] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result =
        await updateProfileAction(form);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message);

      onSave?.({
        firstName: form.firstName,
        middleName:
          form.middleName || null,
        lastName: form.lastName,
        suffix:
          form.suffix || null,
        birthdate: new Date(
          form.birthdate
        ),
        gender: form.gender,
        avatarUrl,
      });

      setTimeout(() => {
        onClose();
      }, 700);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

          <h2 className="mb-6 text-center text-2xl font-bold text-green-900">
            Edit Profile
          </h2>

          <div className="mb-8 flex flex-col items-center">

            <div className="mb-4 h-28 w-28 overflow-hidden rounded-full bg-green-900 shadow">

              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">

                  <svg
                    className="h-14 w-14 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>

                </div>
              )}

            </div>

            <button
              type="button"
              onClick={() =>
                setShowAvatarModal(true)
              }
              className="rounded-lg bg-green-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Change Avatar
            </button>

          </div>

          {[
            ["First Name", "firstName"],
            ["Middle Name", "middleName"],
            ["Last Name", "lastName"],
            ["Suffix", "suffix"],
          ].map(([label, field]) => (
            <div key={field}>

              <label className="mb-1 block text-sm font-medium">
                {label}
              </label>

              <input
                className="mb-4 w-full rounded-lg border p-3"
                value={
                  form[
                    field as keyof typeof form
                  ] as string
                }
                onChange={(e) =>
                  updateField(
                    field as keyof typeof form,
                    e.target.value
                  )
                }
              />

            </div>
          ))}

          <label className="mb-1 block text-sm font-medium">
            Birthdate
          </label>

          <input
            type="date"
            className="mb-4 w-full rounded-lg border p-3"
            value={form.birthdate}
            onChange={(e) =>
              updateField(
                "birthdate",
                e.target.value
              )
            }
          />

          <label className="mb-1 block text-sm font-medium">
            Gender
          </label>

          <select
            className="mb-6 w-full rounded-lg border p-3"
            value={form.gender}
            onChange={(e) =>
              updateField(
                "gender",
                e.target.value
              )
            }
          >
            <option value="Male">
              Male
            </option>

            <option value="Female">
              Female
            </option>
          </select>

          {error && (
            <p className="mb-3 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="mb-3 text-center text-sm text-green-700">
              {message}
            </p>
          )}

          <div className="flex gap-3">

            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border py-3 font-semibold hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 rounded-xl bg-green-900 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </div>

      </div>

      {showAvatarModal && (
        <EditAvatarModal
          currentAvatarUrl={
            avatarUrl
              ? `/${avatarUrl}`
              : null
          }
          onSave={(newAvatarUrl) => {
            setAvatarUrl(newAvatarUrl);
            setShowAvatarModal(false);
          }}
          onClose={() =>
            setShowAvatarModal(false)
          }
        />
      )}
    </>
  );
}