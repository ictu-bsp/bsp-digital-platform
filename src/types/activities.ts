// src/types/activities.ts

export type ActivityCategory =
  | "COUNCIL"
  | "REGIONAL"
  | "NATIONAL";

export interface Activity {
  id: string;

  // Basic Information
  title: string;
  description: string;

  // Schedule
  startDate: string;
  endDate: string;

  // Location
  location: string;

  // Classification
  category: ActivityCategory;

  councilId?: string | null;
  
  // Media
  imageUrl?: string | null;

  // Audit
  createdAt?: string;
  updatedAt?: string;
}

export interface FeaturedBanner {
  id: string;
  title: string;
  imageUrl?: string | null;
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
  activeFilter: ActivityCategory | "all";
  onFilterChange: (filter: ActivityCategory | "all") => void;
}

export interface ActivityListProps {
  activities: Activity[];
  activeFilter: ActivityCategory | "all";
}

export interface ActivityCardProps {
  activity: Activity;
}