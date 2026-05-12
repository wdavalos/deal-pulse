import { detectTierChange } from '../src/lib/partnerstack';
import { PartnerStackDeal } from '../src/types/partnerstack';

describe('PartnerStack', () => {
  describe('detectTierChange', () => {
    it('returns true when tier changes', () => {
      const oldDeal: PartnerStackDeal = {
        id: 'deal-1',
        status: 'active',
        tierCurrent: 1,
        tierMax: 3,
        lastSyncedAt: new Date('2026-05-01'),
      };

      const newDeal: PartnerStackDeal = {
        id: 'deal-1',
        status: 'active',
        tierCurrent: 2,
        tierMax: 3,
        lastSyncedAt: new Date('2026-05-10'),
      };

      expect(detectTierChange(oldDeal, newDeal)).toBe(true);
    });

    it('returns false when tier is same', () => {
      const oldDeal: PartnerStackDeal = {
        id: 'deal-1',
        status: 'active',
        tierCurrent: 2,
        tierMax: 3,
        lastSyncedAt: new Date('2026-05-01'),
      };

      const newDeal: PartnerStackDeal = {
        id: 'deal-1',
        status: 'active',
        tierCurrent: 2,
        tierMax: 3,
        lastSyncedAt: new Date('2026-05-10'),
      };

      expect(detectTierChange(oldDeal, newDeal)).toBe(false);
    });

    it('returns false when oldDeal is null', () => {
      const newDeal: PartnerStackDeal = {
        id: 'deal-1',
        status: 'active',
        tierCurrent: 2,
        tierMax: 3,
        lastSyncedAt: new Date('2026-05-10'),
      };

      expect(detectTierChange(null, newDeal)).toBe(false);
    });
  });
});