import Link from "next/link";

export function AuthLinks() {
  return (
    <p className="mb-4 text-sm text-gray-500">
      Already have an account?{" "}
      <Link className="font-bold text-green-900 hover:underline" href="/login">
        Click to log in
      </Link>
    </p>
  );
}
