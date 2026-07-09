interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`w-full rounded-lg bg-green-900 px-4 py-4 text-center font-bold text-white transition-colors hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
