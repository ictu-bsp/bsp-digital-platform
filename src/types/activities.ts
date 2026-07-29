// src/types/activities.ts
//Scope classifications for scouting activities and events.
export type ActivityCategory =
  | "COUNCIL"
  | "REGIONAL"
  | "NATIONAL";
//Re-export or definition of scout rank types used within activity eligibility context.
export type ScoutRank = "KID" | "KAB" | "BOY" | "SENIOR" | "ROVER";
//Core entity model for a Scouting Activity or Event.
export interface Activity {
  /** Unique identifier string for the activity */
  id: string;
  // Basic Information
  /** Public title/heading of the activity */
  title: string;
  /** Detailed description and instructions for the activity */
  description: string;
  // Schedule
  /** Start timestamp or ISO date string */
  startDate: string;
  /** End timestamp or ISO date string */
  endDate: string;
  // Registration
  /** Flag determining whether new participant sign-ups are currently accepted */
  registrationOpen: boolean;
  // Capacity
  /** Maximum participant threshold allowed, or `null` if unlimited */
  maxParticipants?: number | null;
  /** Total count of registered participants currently enrolled */
  registeredCount: number;
  // Eligibility
  /** Minimum rank required to join, or `null` if unrestricted */
  minimumRank?: ScoutRank | null;
  // Location
  /** Physical venue or full address string */
  location: string;
  // Classification
  /** Scope tier of the activity */
  category: ActivityCategory;
  /** Associated local council ID if category is 'COUNCIL', or `null` for broader scope */
  councilId?: string | null;
  // Media
  /** Optional header or promotional banner image URL */
  imageUrl?: string | null;
  // Audit
  /** ISO timestamp string recording when record was created */
  createdAt?: string;
  /** ISO timestamp string recording last update */
  updatedAt?: string;
}
//Model representing a highlighted banner item in promotional carousels.
export interface FeaturedBanner {
  id: string;
  title: string;
  imageUrl?: string | null;
  linkUrl?: string;
  backgroundColor?: string;
}
//Props for the scout header bar component.
export interface HeaderProps {
  userName: string;
  avatarUrl?: string;
}
//Props for rendering the top featured carousel on scouting pages.
export interface FeaturedCarouselProps {
  banners: FeaturedBanner[];
}
//Props for activity scope category filter tabs.
export interface FilterTabsProps {
  activeFilter: ActivityCategory | "all";
  onFilterChange: (filter: ActivityCategory | "all") => void;
}
//Props for activity collection list views.
export interface ActivityListProps {
  activities: Activity[];
  activeFilter: ActivityCategory | "all";
  emptyMessage?: string;
}
//Props for individual activity display cards.
export interface ActivityCardProps {
  activity: Activity;
}