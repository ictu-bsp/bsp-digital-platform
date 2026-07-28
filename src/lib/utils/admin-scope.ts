// src/lib/utils/admin-scope.ts

export type AdminScope =
  | { tier: "COUNCIL"; councilId: string }
  | { tier: "REGIONAL"; regionId: string }
  | { tier: "NATIONAL" }
  | { tier: "SUPER" };

type ScopableUser = {
  role: string;
  councilId?: string | null;
  regionId?: string | null;
};

/**
 * Resolves which officers a top-level admin account (a COUNCIL_ADMIN,
 * REGIONAL_ADMIN, NATIONAL_ADMIN, or SUPER_ADMIN user) is allowed to log
 * in as. SUPER_ADMIN is intentionally unscoped — it's the true system
 * account and can access every officer everywhere. The other three tiers
 * are strictly limited to their own council/region/national officer set.
 *
 * Returns null if the user's role isn't an admin role at all, or if a
 * COUNCIL_ADMIN/REGIONAL_ADMIN is missing the council/region they should
 * have been assigned.
 */
export function resolveAdminScope(
  user: ScopableUser
): AdminScope | null {
  switch (user.role) {
    case "SUPER_ADMIN":
      return { tier: "SUPER" };
    case "NATIONAL_ADMIN":
      return { tier: "NATIONAL" };
    case "REGIONAL_ADMIN":
      return user.regionId
        ? { tier: "REGIONAL", regionId: user.regionId }
        : null;
    case "COUNCIL_ADMIN":
      return user.councilId
        ? { tier: "COUNCIL", councilId: user.councilId }
        : null;
    default:
      return null;
  }
}
