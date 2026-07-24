// src/db/schema/index.ts

// 1. Core independent tables and enums
export * from "./enums";
export * from "./roles";
export * from "./regions";
export * from "./councils";
export * from "./users";
export * from "./adminUsers";

// 2. Dependent entity tables
export * from "./scouts";
export * from "./scoutApplications";
export * from "./scout-registrations";
export * from "./pending-user-registrations";

// 3. Other application modules
export * from "./activities";
export * from "./activity-registrations";
export * from "./advancements";
export * from "./announcements";
export * from "./email-verifications";
export * from "./meritbadges";
export * from "./payments";
export * from "./sessions";
export * from "./admin";