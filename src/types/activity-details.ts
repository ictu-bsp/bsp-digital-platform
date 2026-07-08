export interface ActivityDetail {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  cost: string;
  status: 'ongoing' | 'closed' | 'upcoming';
  logoUrl: string;
}

export interface ActivityMetaBadgesProps {
  startDate: string;
  endDate: string;
  location: string;
  cost: string;
  status: 'ongoing' | 'closed' | 'upcoming';
}

export interface JoinButtonProps {
  activityId: string;
}

export interface PageProps {
  params: Promise<{ id: string }>;
}
