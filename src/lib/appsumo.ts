import Parser from 'rss-parser';
import { AppSumoDeal, AppSumoEvent } from '../types/appsumo';

const parser = new Parser();

export async function fetchAppSumoDeals(): Promise<AppSumoDeal[]> {
  const feed = await parser.parseURL('https://appsumo.com/feed/deals');

  return feed.items.map((item) => {
    const title = item.title || '';
    const url = item.link || '';

    // Extract tier from title (e.g., "Deal Title [Tier 2]")
    const tierMatch = title.match(/\[(Tier \d+)\]/i);
    const tier = tierMatch ? tierMatch[1] : undefined;

    // Determine status - AppSumo typically marks expired deals in the title
    const isExpired = title.toLowerCase().includes('[expired]') ||
                      item.content?.toLowerCase().includes('expired') ||
                      false;

    return {
      title,
      url,
      status: isExpired ? 'expired' : 'live',
      tier,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    };
  });
}

export function detectAppSumoEvents(
  oldDeals: AppSumoDeal[],
  newDeals: AppSumoDeal[]
): AppSumoEvent[] {
  const events: AppSumoEvent[] = [];

  // Create maps for easier lookup
  const oldUrlSet = new Set(oldDeals.map((d) => d.url));
  const newUrlSet = new Set(newDeals.map((d) => d.url));

  // Check for new deals (live events)
  for (const newDeal of newDeals) {
    if (!oldUrlSet.has(newDeal.url) && newDeal.status === 'live') {
      events.push({
        type: 'live',
        dealUrl: newDeal.url,
        details: `New deal: ${newDeal.title}`,
        occurredAt: new Date(),
      });
    }
  }

  // Check for expired deals
  for (const oldDeal of oldDeals) {
    const newDeal = newDeals.find((d) => d.url === oldDeal.url);

    if (newDeal && oldDeal.status === 'live' && newDeal.status === 'expired') {
      events.push({
        type: 'expired',
        dealUrl: newDeal.url,
        details: `Deal expired: ${newDeal.title}`,
        occurredAt: new Date(),
      });
    }
  }

  return events;
}