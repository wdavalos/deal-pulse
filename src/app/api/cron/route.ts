import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchAppSumoDeals } from '@/lib/appsumo';
import { fetchPartnerStackDeal, detectTierChange } from '@/lib/partnerstack';
import { PartnerStackDeal } from '@/types/partnerstack';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify cron secret via Authorization header
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    );
  }

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Fetch all active deals from DB with events
    const activeDeals = await prisma.deal.findMany({
      where: { status: 'active' },
      include: { events: { orderBy: { occurredAt: 'desc' } } },
    });

    // Fetch current AppSumo deals
    const currentAppSumoDeals = await fetchAppSumoDeals();

    let processedCount = 0;

    for (const deal of activeDeals) {
      try {
        // Find matching AppSumo deal by URL
        const matchingDeal = currentAppSumoDeals.find(
          (d) => d.url === deal.appsumoUrl
        );

        // Check for tier changes if PartnerStack API key exists
        if (deal.partnerstackApiKey) {
          const currentPartnerStackDeal: PartnerStackDeal | null = await fetchPartnerStackDeal(
            deal.partnerstackApiKey,
            deal.id
          );

          if (currentPartnerStackDeal) {
            // Get the most recent tier_filled event to compare
            const lastTierEvent = deal.events.find((e) => e.type === 'tier_filled');
            let previousDeal: PartnerStackDeal | null = null;

            if (lastTierEvent) {
              // Try to reconstruct previous state from the event details
              // For simplicity, we'll use a basic approach
              const tierMatch = lastTierEvent.details?.match(/Tier (\d+)/i);
              if (tierMatch) {
                previousDeal = {
                  id: deal.id,
                  status: 'active',
                  tierCurrent: parseInt(tierMatch[1], 10),
                  tierMax: currentPartnerStackDeal.tierMax,
                  lastSyncedAt: lastTierEvent.occurredAt,
                };
              }
            }

            // Only check for tier change if we successfully extracted a previous tier
            if (previousDeal !== null && detectTierChange(previousDeal, currentPartnerStackDeal)) {
              // Create tier_filled event
              await prisma.event.create({
                data: {
                  dealId: deal.id,
                  type: 'tier_filled',
                  details: `Tier ${currentPartnerStackDeal.tierCurrent} reached`,
                  occurredAt: new Date(),
                },
              });
            }
          }
        }

        // Check if deal expired
        if (matchingDeal && matchingDeal.status === 'expired') {
          // Check if we already have an expired event for this deal
          const hasExpiredEvent = deal.events.some((e) => e.type === 'expired');

          if (!hasExpiredEvent) {
            await prisma.event.create({
              data: {
                dealId: deal.id,
                type: 'expired',
                details: `Deal expired: ${matchingDeal.title}`,
                occurredAt: new Date(),
              },
            });
          }
        }

        // Update lastChecked timestamp
        await prisma.deal.update({
          where: { id: deal.id },
          data: { lastChecked: new Date() },
        });

        processedCount++;
      } catch (error) {
        console.error(`Error processing deal ${deal.id}:`, error);
        // Continue processing other deals instead of failing the entire batch
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}