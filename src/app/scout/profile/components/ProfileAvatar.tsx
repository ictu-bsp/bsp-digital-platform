"use client";

import { useRef } from "react";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  onEditClick: () => void;
}

export default function ProfileAvatar({ avatarUrl, onEditClick }: ProfileAvatarProps) {
  return (
    <div className="flex justify-center py-6">
      <div className="relative group cursor-pointer">
        <div className="h-32 w-32 rounded-full bg-green-900 flex items-center justify-center shadow-md transition-transform group-hover:scale-105 group-hover:shadow-lg">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User Avatar"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <svg
              className="h-16 w-16 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>
        <button
          onClick={onEditClick}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 px-4 py-1.5 bg-white border border-gray-300 rounded-full text-sm font-semibold text-slate-800 hover:bg-green-50 hover:border-green-400 hover:shadow-md hover:scale-110 transition cursor-pointer flex items-center gap-1.5"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </button>
      </div>
    </div>
  );
}
