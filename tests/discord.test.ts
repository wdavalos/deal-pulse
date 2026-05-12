import { sendDiscordAlert, buildDiscordPayload, DiscordAlert } from '../src/lib/discord';

describe('sendDiscordAlert', () => {
  const alert: DiscordAlert = {
    type: 'live',
    dealTitle: 'Test Deal',
    dealUrl: 'https://appsumo.com/deal-1',
  };

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns success=true on HTTP 200', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
    } as Response;
    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

    const result = await sendDiscordAlert('https://discord.com/api/webhooks/test', alert);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.statusCode).toBeUndefined();
  });

  it('returns success=false with error info on HTTP 400', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    } as Response;
    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

    const result = await sendDiscordAlert('https://discord.com/api/webhooks/test', alert);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Discord API error: 400 Bad Request');
    expect(result.statusCode).toBe(400);
  });

  it('returns success=false with error info on HTTP 404', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response;
    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

    const result = await sendDiscordAlert('https://discord.com/api/webhooks/test', alert);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Discord API error: 404 Not Found');
    expect(result.statusCode).toBe(404);
  });

  it('returns success=false with error info on HTTP 500', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response;
    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

    const result = await sendDiscordAlert('https://discord.com/api/webhooks/test', alert);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Discord API error: 500 Internal Server Error');
    expect(result.statusCode).toBe(500);
  });

  it('returns success=false on network failure', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('ENOTFOUND'));

    const result = await sendDiscordAlert('https://discord.com/api/webhooks/test', alert);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network failure: ENOTFOUND');
  });

  it('returns success=false on network timeout', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Timeout exceeded'));

    const result = await sendDiscordAlert('https://discord.com/api/webhooks/test', alert);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network failure: Timeout exceeded');
  });

  it('returns success=false for empty string webhookUrl', async () => {
    const result = await sendDiscordAlert('', alert);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid webhookUrl: must be a non-empty string');
  });

  it('returns success=false for whitespace-only webhookUrl', async () => {
    const result = await sendDiscordAlert('   ', alert);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid webhookUrl: must be a non-empty string');
  });

  it('returns success=false for null-like webhookUrl', async () => {
    const result = await sendDiscordAlert('not-a-url', alert);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid webhookUrl: must be a valid URL');
  });

  it('returns success=false for non-http/https URL', async () => {
    const result = await sendDiscordAlert('ftp://discord.com/webhook', alert);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid webhookUrl: must use http or https protocol');
  });

  it('returns success=false for file:// URL', async () => {
    const result = await sendDiscordAlert('file:///etc/passwd', alert);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid webhookUrl: must use http or https protocol');
  });

  it('calls fetch with correct arguments', async () => {
    const mockResponse = { ok: true, status: 200, statusText: 'OK' } as Response;
    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

    await sendDiscordAlert('https://discord.com/api/webhooks/abc123', alert);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://discord.com/api/webhooks/abc123',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });
});

describe('buildDiscordPayload', () => {
  it('has color 0x00ff00 for live deal payload', () => {
    const alert: DiscordAlert = {
      type: 'live',
      dealTitle: 'Test Deal',
      dealUrl: 'https://appsumo.com/deal-1',
    };
    const payload = buildDiscordPayload(alert);
    expect(payload.embeds[0].color).toBe(0x00ff00);
  });

  it('has color 0xffaa00 for tier_filled payload', () => {
    const alert: DiscordAlert = {
      type: 'tier_filled',
      dealTitle: 'Test Deal',
      dealUrl: 'https://appsumo.com/deal-1',
    };
    const payload = buildDiscordPayload(alert);
    expect(payload.embeds[0].color).toBe(0xffaa00);
  });

  it('has color 0xff0000 for expired payload', () => {
    const alert: DiscordAlert = {
      type: 'expired',
      dealTitle: 'Test Deal',
      dealUrl: 'https://appsumo.com/deal-1',
    };
    const payload = buildDiscordPayload(alert);
    expect(payload.embeds[0].color).toBe(0xff0000);
  });

  it('uses dealTitle as default description when details is not provided', () => {
    const alert: DiscordAlert = {
      type: 'live',
      dealTitle: 'My Amazing Deal',
      dealUrl: 'https://appsumo.com/deal-1',
    };
    const payload = buildDiscordPayload(alert);
    expect(payload.embeds[0].description).toBe('New AppSumo deal: My Amazing Deal');
  });

  it('timestamp is in ISO format', () => {
    const alert: DiscordAlert = {
      type: 'live',
      dealTitle: 'Test Deal',
      dealUrl: 'https://appsumo.com/deal-1',
    };
    const payload = buildDiscordPayload(alert);
    expect(payload.embeds[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
  });
});