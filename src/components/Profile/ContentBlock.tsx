interface ContentBlockProps {
  children?: React.ReactNode;
  className?: string;
}

export default function ContentBlock({ children, className = "" }: ContentBlockProps) {
  return (
    <div className={`mx-4 mb-4 p-4 bg-gray-100 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}
