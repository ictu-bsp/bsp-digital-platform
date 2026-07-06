interface Props {
  label: string;
  type?: string;
  placeholder?: string;
}

export default function InputField({
  label,
  type = "text",
  placeholder,
}: Props) {
  return (
    <div className="w-full mb-4">
      <label className="block text-sm font-semibold text-green-900 mb-2">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="
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
        "
      />
    </div>
  );
}