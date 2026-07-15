// src/app/scout/components/NotificationSection.tsx

import NotificationCard from "./NotificationCard";

interface NotificationSectionProps {
  role: "VISITOR" | "SCOUT" | "COUNCIL_ADMIN" | "SUPER_ADMIN";
}

export default function NotificationSection({
  role,
}: NotificationSectionProps) {
  return (
    <section className="px-4 pt-6">
      <h2 className="mb-3 text-lg font-bold text-slate-900">
        Notifications
      </h2>

      <div className="space-y-3">
        {role === "VISITOR" ? (
          <NotificationCard
            title="Become a Scout"
            description="Apply for membership to unlock activities, reports, and advancement tracking."
            date="Today"
          />
        ) : (
          <>
            <NotificationCard
              title="Upcoming Activity"
              description="Tree Planting Activity starts this Saturday."
              date="Today"
            />

            <NotificationCard
              title="Attendance Reminder"
              description="Don't forget to check in before your scheduled activity."
              date="Yesterday"
            />
          </>
        )}
      </div>
    </section>
  );
}