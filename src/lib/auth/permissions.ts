export enum UserRole {
  SCOUT = "scout",
  COUNCIL_ADMIN = "council_admin",
  NATIONAL_ADMIN = "national_admin",
}

export function isScout(role: string) {
  return role === UserRole.SCOUT;
}

export function isCouncilAdmin(role: string) {
  return role === UserRole.COUNCIL_ADMIN;
}

export function isNationalAdmin(role: string) {
  return role === UserRole.NATIONAL_ADMIN;
}