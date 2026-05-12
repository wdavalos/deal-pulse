export interface AppSumoDeal {
  title: string;
  url: string;
  status: 'live' | 'expired';
  tier?: string;
  publishedAt: Date;
}

export interface AppSumoEvent {
  type: 'live' | 'tier_filled' | 'expired';
  dealUrl: string;
  details: string;
  occurredAt: Date;
}