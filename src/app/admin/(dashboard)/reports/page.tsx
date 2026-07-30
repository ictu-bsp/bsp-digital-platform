// src/app/admin/(dashbaord)/reports/page.tsx
import ReportsView from "./components/ReportsView";
import { requireAdminPage } from "@/lib/auth/require-admin";

export default async function AdminReportsPage() {
  await requireAdminPage(["CHIEF_EXECUTIVE", "REPORTS_OFFICER"]);
  return <ReportsView />;
}