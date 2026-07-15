import ScoutingActivitiesScreen from './components/ScoutingActivitiesScreen';
import type { Activity, FeaturedBanner } from '@/types/activities';
import { getCurrentUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";

const banners: FeaturedBanner[] = [
  { id: 'banner-1', imageUrl: '/placeholder-banner-1.svg', linkUrl: '#' },
  { id: 'banner-2', imageUrl: '/placeholder-banner-2.svg', linkUrl: '#' },
  { id: 'banner-3', imageUrl: '/placeholder-banner-3.svg', linkUrl: '#' },
];

const activities: Activity[] = [
  {
    id: 'activity-1',
    title: '',
    startDate: '',
    endDate: '',
    location: '',
    category: 'council',
    thumbnailColor: 'bg-blue-600',
  },
  {
    id: 'activity-2',
    title: '',
    startDate: '',
    endDate: '',
    location: '',
    category: 'regional',
    thumbnailColor: 'bg-emerald-600',
  },
  {
    id: 'activity-3',
    title: '',
    startDate: '',
    endDate: '',
    location: '',
    category: 'national',
    thumbnailColor: 'bg-amber-500',
  },
];

export default async function ActivitiesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const canViewActivities =
  user.role === "SCOUT" ||
  user.role === "COUNCIL_ADMIN" ||
  user.role === "SUPER_ADMIN";

  if (!canViewActivities) {
    redirect("/scout/membership");
  }

  return (
    <ScoutingActivitiesScreen
      userName={user.firstName} avatarUrl={user.avatarUrl ?? undefined}
      banners={banners}
      activities={activities}
    />
  );
}
