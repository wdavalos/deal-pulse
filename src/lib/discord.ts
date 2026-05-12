export interface DiscordAlert {
  type: 'live' | 'tier_filled' | 'expired';
  dealTitle: string;
  dealUrl: string;
  details?: string;
}

export interface DiscordWebhookPayload {
  content: string;
  embeds: Array<{
    title: string;
    url: string;
    description: string;
    color: number;
    timestamp: string;
  }>;
}

export function getAlertColor(type: DiscordAlert['type']): number {
  switch (type) {
    case 'live':
      return 0x00ff00;
    case 'tier_filled':
      return 0xffaa00;
    case 'expired':
      return 0xff0000;
    default:
      return 0xffffff;
  }
}

export function getAlertTitle(type: DiscordAlert['type']): string {
  switch (type) {
    case 'live':
      return '🎉 Deal is LIVE!';
    case 'tier_filled':
      return '⚠️ Tier Filled!';
    case 'expired':
      return '❌ Deal Expired';
    default:
      return 'Deal Update';
  }
}

export function buildDiscordPayload(alert: DiscordAlert): DiscordWebhookPayload {
  return {
    content: '',
    embeds: [
      {
        title: getAlertTitle(alert.type),
        url: alert.dealUrl,
        description: alert.details || `New AppSumo deal: ${alert.dealTitle}`,
        color: getAlertColor(alert.type),
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export interface DiscordAlertResult {
  success: boolean;
  error?: string;
  statusCode?: number;
}

export async function sendDiscordAlert(
  webhookUrl: string,
  alert: DiscordAlert
): Promise<DiscordAlertResult> {
  if (!webhookUrl || typeof webhookUrl !== 'string' || webhookUrl.trim().length === 0) {
    return { success: false, error: 'Invalid webhookUrl: must be a non-empty string' };
  }

  try {
    const url = new URL(webhookUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { success: false, error: 'Invalid webhookUrl: must use http or https protocol' };
    }
  } catch {
    return { success: false, error: 'Invalid webhookUrl: must be a valid URL' };
  }

  try {
    const payload = buildDiscordPayload(alert);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Discord API error: ${response.status} ${response.statusText}`,
        statusCode: response.status,
      };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Network failure: ${message}` };
  }
}
