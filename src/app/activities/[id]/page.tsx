import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ActivityMetaBadges from '@/components/ActivityMetaBadges';
import JoinButton from '@/components/JoinButton';
import type { ActivityDetail, PageProps } from '@/types/activity-details';

const activities: ActivityDetail[] = [
  {
    id: 'activity-1',
    title: 'aaa',
    description:
      'aaa',
    startDate: 'aaa',
    endDate: 'aaa',
    location: 'aaa',
    cost: 'aaa',
    status: 'upcoming',
    logoUrl: 'aaa',
  },
  {
    id: 'activity-2',
    title: 'aaa',
    description:
      'aaa',
    startDate: 'aaa',
    endDate: 'aaa',
    location: 'aaa',
    cost: 'aaa',
    status: 'upcoming',
    logoUrl: 'aaa',
  },
  {
    id: 'activity-3',
    title: 'aaa',
    description:
      'aaa',
    startDate: 'aaa',
    endDate: 'aaa',
    location: 'aaa',
    cost: 'aaa',
    status: 'upcoming',
    logoUrl: '/placeholder-banner-3.svg',
  },
];

export default async function ActivityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const activity = activities.find((item) => item.id === id);

  if (!activity) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">
          <Header userName="Juan" avatarUrl={undefined} />
          <div className="flex-1 px-4 py-6">
            <p className="text-sm text-slate-600">Activity not found.</p>
          </div>
          <BottomNav />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <Header userName="Juan" avatarUrl={undefined} />

        <div className="flex-1 overflow-y-auto pb-28">
          <div className="space-y-5 px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
              Scouting Activities
            </p>

            <h1 className="text-2xl font-bold leading-tight text-green-900">
              {activity.title}
            </h1>

            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex-1 space-y-4">
                <p className="text-sm leading-7 text-slate-700">{activity.description}</p>
                <ActivityMetaBadges
                  startDate={activity.startDate}
                  endDate={activity.endDate}
                  location={activity.location}
                  cost={activity.cost}
                  status={activity.status}
                />
              </div>

              <div className="flex items-center justify-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-xl border-[10px] border-emerald-200 bg-emerald-100 shadow-inner">
                  <img
                    src={activity.logoUrl}
                    alt={`${activity.title} logo`}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <JoinButton activityId={activity.id} />
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </main>
  );
}
