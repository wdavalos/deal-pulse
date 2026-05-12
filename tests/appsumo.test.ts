import { fetchAppSumoDeals, detectAppSumoEvents } from '../src/lib/appsumo';
import { AppSumoDeal } from '../src/types/appsumo';

// Mock the rss-parser module to avoid network calls
jest.mock('rss-parser', () => {
  return jest.fn().mockImplementation(() => ({
    parseURL: jest.fn().mockResolvedValue({
      items: [
        {
          title: 'Test Deal 1',
          link: 'https://appsumo.com/deal-1',
          pubDate: '2026-05-10T10:00:00Z',
          content: 'Some deal content',
        },
        {
          title: 'Test Deal 2 [Tier 2]',
          link: 'https://appsumo.com/deal-2',
          pubDate: '2026-05-09T10:00:00Z',
          content: 'Another deal [expired]',
        },
      ],
    }),
  }));
});

describe('AppSumo RSS Parser', () => {
  describe('fetchAppSumoDeals', () => {
    it('returns an array of deals', async () => {
      const deals = await fetchAppSumoDeals();
      expect(Array.isArray(deals)).toBe(true);
    });

    it('each deal has required fields', async () => {
      const deals = await fetchAppSumoDeals();
      expect(deals.length).toBeGreaterThan(0);
      const deal = deals[0];
      expect(deal).toHaveProperty('title');
      expect(deal).toHaveProperty('url');
      expect(deal).toHaveProperty('status');
      expect(deal).toHaveProperty('publishedAt');
      expect(['live', 'expired']).toContain(deal.status);
    });

    it('parses tier from title', async () => {
      const deals = await fetchAppSumoDeals();
      const tierDeal = deals.find((d) => d.title.includes('Tier 2'));
      expect(tierDeal).toBeDefined();
      expect(tierDeal?.tier).toBe('Tier 2');
    });
  });

  describe('detectAppSumoEvents', () => {
    it('detects new deals', () => {
      const oldDeals: AppSumoDeal[] = [
        { title: 'Deal A', url: 'https://appsumo.com/deal-a', status: 'live', publishedAt: new Date() },
      ];

      const newDeals: AppSumoDeal[] = [
        { title: 'Deal A', url: 'https://appsumo.com/deal-a', status: 'live', publishedAt: new Date() },
        { title: 'Deal B', url: 'https://appsumo.com/deal-b', status: 'live', publishedAt: new Date() },
      ];

      const events = detectAppSumoEvents(oldDeals, newDeals);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('live');
      expect(events[0].dealUrl).toBe('https://appsumo.com/deal-b');
    });

    it('detects expired deals', () => {
      const oldDeals: AppSumoDeal[] = [
        { title: 'Deal A', url: 'https://appsumo.com/deal-a', status: 'live', publishedAt: new Date() },
      ];

      const newDeals: AppSumoDeal[] = [
        { title: 'Deal A', url: 'https://appsumo.com/deal-a', status: 'expired', publishedAt: new Date() },
      ];

      const events = detectAppSumoEvents(oldDeals, newDeals);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('expired');
      expect(events[0].dealUrl).toBe('https://appsumo.com/deal-a');
    });

    it('returns empty array when no changes', () => {
      const oldDeals: AppSumoDeal[] = [
        { title: 'Deal A', url: 'https://appsumo.com/deal-a', status: 'live', publishedAt: new Date() },
      ];

      const newDeals: AppSumoDeal[] = [
        { title: 'Deal A', url: 'https://appsumo.com/deal-a', status: 'live', publishedAt: new Date() },
      ];

      const events = detectAppSumoEvents(oldDeals, newDeals);

      expect(events).toHaveLength(0);
    });
  });
});