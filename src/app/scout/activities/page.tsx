import ScoutingActivitiesScreen from './components/ScoutingActivitiesScreen';
import type { Activity, FeaturedBanner } from '@/types/activities';

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

export default function ActivitiesPage() {
  return (
    <ScoutingActivitiesScreen
      userName="Juan"
      avatarUrl={undefined}
      banners={banners}
      activities={activities}
    />
  );
}
