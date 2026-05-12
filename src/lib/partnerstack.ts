import { PartnerStackDeal } from '../types/partnerstack';

const PARTNERSTACK_API_BASE = 'https://api.partnerstack.com/api/v1';

export async function fetchPartnerStackDeal(
  apiKey: string,
  dealId: string
): Promise<PartnerStackDeal | null> {
  try {
    const response = await fetch(`${PARTNERSTACK_API_BASE}/deals/${dealId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      id: data.id as string,
      status: data.status as 'active' | 'paused' | 'exhausted',
      tierCurrent: data.tier_current as number,
      tierMax: data.tier_max as number,
      lastSyncedAt: new Date(data.last_synced_at as string),
    };
  } catch {
    return null;
  }
}

export async function fetchAllPartnerStackDeals(
  apiKey: string
): Promise<PartnerStackDeal[]> {
  try {
    const response = await fetch(`${PARTNERSTACK_API_BASE}/deals`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return (data.deals || []).map(
      (deal: {
        id: string;
        status: 'active' | 'paused' | 'exhausted';
        tier_current: number;
        tier_max: number;
        last_synced_at: string;
      }) => ({
        id: deal.id,
        status: deal.status,
        tierCurrent: deal.tier_current,
        tierMax: deal.tier_max,
        lastSyncedAt: new Date(deal.last_synced_at),
      })
    );
  } catch {
    return [];
  }
}

export function detectTierChange(
  oldDeal: PartnerStackDeal | null,
  newDeal: PartnerStackDeal
): boolean {
  if (oldDeal === null) {
    return false;
  }
  return oldDeal.tierCurrent !== newDeal.tierCurrent;
}