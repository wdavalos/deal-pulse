import { buildDiscordPayload, DiscordAlert } from '../src/lib/discord';

describe('Discord Webhook', () => {
  describe('buildDiscordPayload', () => {
    it('creates payload for live deal with green color (0x00ff00)', () => {
      const alert: DiscordAlert = {
        type: 'live',
        dealTitle: 'Test Live Deal',
        dealUrl: 'https://appsumo.com/deal-1',
      };

      const payload = buildDiscordPayload(alert);

      expect(payload.content).toBe('');
      expect(payload.embeds).toHaveLength(1);
      expect(payload.embeds[0].title).toBe('🎉 Deal is LIVE!');
      expect(payload.embeds[0].url).toBe('https://appsumo.com/deal-1');
      expect(payload.embeds[0].color).toBe(0x00ff00);
    });

    it('creates payload for tier_filled with orange color (0xffaa00)', () => {
      const alert: DiscordAlert = {
        type: 'tier_filled',
        dealTitle: 'Tier Deal',
        dealUrl: 'https://appsumo.com/deal-2',
        details: 'Tier 2 has been filled',
      };

      const payload = buildDiscordPayload(alert);

      expect(payload.embeds).toHaveLength(1);
      expect(payload.embeds[0].title).toBe('⚠️ Tier Filled!');
      expect(payload.embeds[0].color).toBe(0xffaa00);
      expect(payload.embeds[0].description).toBe('Tier 2 has been filled');
    });

    it('creates payload for expired deal with red color (0xff0000)', () => {
      const alert: DiscordAlert = {
        type: 'expired',
        dealTitle: 'Expired Deal',
        dealUrl: 'https://appsumo.com/deal-3',
      };

      const payload = buildDiscordPayload(alert);

      expect(payload.embeds).toHaveLength(1);
      expect(payload.embeds[0].title).toBe('❌ Deal Expired');
      expect(payload.embeds[0].color).toBe(0xff0000);
    });

    it('uses dealTitle as default description when details is not provided', () => {
      const alert: DiscordAlert = {
        type: 'live',
        dealTitle: 'Some Deal',
        dealUrl: 'https://appsumo.com/deal-4',
      };

      const payload = buildDiscordPayload(alert);

      expect(payload.embeds[0].description).toBe('New AppSumo deal: Some Deal');
    });

    it('includes timestamp in ISO format', () => {
      const alert: DiscordAlert = {
        type: 'live',
        dealTitle: 'Test Deal',
        dealUrl: 'https://appsumo.com/deal-5',
      };

      const payload = buildDiscordPayload(alert);

      expect(payload.embeds[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});