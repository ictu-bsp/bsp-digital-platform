// src/app/admin/(dashboard)/system-users/create/page.tsx

import { requireAdminPage } from "@/lib/auth/require-admin";
import { getCouncilsAction, getRegionsAction } from "@/app/actions/councils";
import CreateSystemUserForm from "./CreateSystemUserForm";

// Server component: resolves who's logged in and what tier they operate
// at, then hands that context to the client form. Scope is never something
// the person filling out the form gets to choose for themselves -- it's
// inherited from their own account, except for the true SUPER_ADMIN system
// account, which can target any council/region/national tier explicitly.
export default async function CreateSystemUserPage() {
  // Matches the "System Users" menu item's role list in admin-menu.ts.
  const { scope } = await requireAdminPage(["CHIEF_EXECUTIVE"]);

  let councils: { id: string; name: string }[] = [];
  let regions: { id: string; name: string }[] = [];

  if (scope.tier === "SUPER") {
    const [councilsResult, regionsResult] = await Promise.all([
      getCouncilsAction(),
      getRegionsAction(),
    ]);
    councils = councilsResult.success ? councilsResult.data ?? [] : [];
    regions = regionsResult.success ? regionsResult.data ?? [] : [];
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-emerald-800">Add System User</h1>
      <p className="text-zinc-500 mt-1">
        Create a new system user account and assign it a role.
      </p>

      <div className="mt-6 max-w-2xl">
        <CreateSystemUserForm scope={scope} councils={councils} regions={regions} />
      </div>
    </div>
  );
}
