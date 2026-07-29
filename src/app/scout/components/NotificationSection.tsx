//src/app/scout/components/NotificationSection.tsx

import Link from "next/link";
import NotificationCard from "./NotificationCard";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link: string | null;
  createdAt: Date;
}

interface Props {
  notifications: NotificationItem[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
  });
}

export default function NotificationSection({
  notifications,
}: Props) {
  return (
    <section className="px-4 pt-6">
      <h2 className="mb-3 text-lg font-bold text-slate-900">
        Notifications
      </h2>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500">
            No notifications yet.
          </p>
        ) : (
          notifications.map((item) => {
            const card = (
              <NotificationCard
                title={item.title}
                description={item.message}
                date={formatDate(item.createdAt)}
              />
            );

            return item.link ? (
              <Link key={item.id} href={item.link} className="block">
                {card}
              </Link>
            ) : (
              <div key={item.id}>{card}</div>
            );
          })
        )}
      </div>
    </section>
  );
}
