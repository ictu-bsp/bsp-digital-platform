export interface ActivityMetaBadgesProps {
  startDate: string;
  endDate?: string;
  location: string;
  cost?: string;
}

export interface JoinButtonProps {
  activityId: string;
}

export interface PageProps {
  params: Promise<{
    id: string;
  }>;
}