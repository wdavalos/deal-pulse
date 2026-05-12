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

export async function sendDiscordAlert(
  webhookUrl: string,
  alert: DiscordAlert
): Promise<boolean> {
  try {
    const payload = buildDiscordPayload(alert);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to send Discord alert:', error);
    return false;
  }
}