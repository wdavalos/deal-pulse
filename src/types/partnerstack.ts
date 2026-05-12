export interface PartnerStackDeal {
  id: string;
  status: 'active' | 'paused' | 'exhausted';
  tierCurrent: number;
  tierMax: number;
  lastSyncedAt: Date;
}

export interface PartnerStackAffiliate {
  id: string;
  email: string;
  status: 'active' | 'churned';
}