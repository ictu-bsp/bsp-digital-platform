import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function InputField({
  label,
  className = "",
  ...props
}: Props) {
  return (
    <div className="w-full mb-4">
      <label className="block text-sm font-semibold text-green-900 mb-2">
        {label}
      </label>

      <input
        {...props}
        className={`
          w-full
          rounded-xl
          border
          border-green-200
          px-4
          py-3
          outline-none
          bg-white/90
          focus:border-green-700
          focus:ring-2
          focus:ring-green-300
          transition
          ${className}
        `}
      />
    </div>
  );
}