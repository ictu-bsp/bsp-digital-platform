import { getAdminUsers } from "@/services/admin.service";

const ROLE_LABELS: Record<string, string> = {
  CHIEF_EXECUTIVE: "Chief Executive",
  MEMBERSHIP_OFFICER: "Membership Officer",
  ACTIVITIES_OFFICER: "Activities Officer",
  FINANCE_OFFICER: "Finance Officer",
  REGISTRAR: "Registrar",
  REPORTS_OFFICER: "Reports Officer",
};

function formatDate(value: Date | string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function OfficersPage() {
  const officers = await getAdminUsers();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-emerald-800">Manage Officers</h1>
      <p className="text-zinc-500 mt-1 mb-6">
        View all officer accounts across councils.
      </p>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 text-zinc-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 font-semibold">Full Name</th>
              <th className="px-5 py-3 font-semibold">Username</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Council</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Last Login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {officers.map((officer) => (
              <tr key={officer.id} className="text-zinc-800">
                <td className="px-5 py-3 font-medium">{officer.fullName}</td>
                <td className="px-5 py-3 text-zinc-500">{officer.username}</td>
                <td className="px-5 py-3">
                  {ROLE_LABELS[officer.role] ?? officer.role}
                </td>
                <td className="px-5 py-3">{officer.council}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      officer.active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {officer.active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-5 py-3 text-zinc-500">
                  {formatDate(officer.lastLoginAt)}
                </td>
              </tr>
            ))}

            {officers.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-zinc-400"
                >
                  No officer accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}