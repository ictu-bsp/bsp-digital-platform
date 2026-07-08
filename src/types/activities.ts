export interface Activity {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  category: 'national' | 'regional' | 'council';
  thumbnailColor: string;
  badgeImageUrl?: string;
}

export interface FeaturedBanner {
  id: string;
  imageUrl?: string;
  linkUrl?: string;
}

export interface HeaderProps {
  userName: string;
  avatarUrl?: string;
}

export interface FeaturedCarouselProps {
  banners: FeaturedBanner[];
}

export interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export interface ActivityListProps {
  activities: Activity[];
  activeFilter: string;
}

export interface ActivityCardProps {
  activity: Activity;
}
