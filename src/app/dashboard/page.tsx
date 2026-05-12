'use client';

import { useEffect, useState } from 'react';
import { DealCard } from '@/components/DealCard';
import { EventLog } from '@/components/EventLog';

interface Deal {
  id: string;
  appsumoUrl: string;
  status: string;
  lastChecked: string | null;
}

interface Event {
  id: string;
  type: string;
  details: string | null;
  occurredAt: string;
}

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/deals');
        if (response.ok) {
          const data = await response.json();
          setDeals(data.deals || []);
          setEvents(data.events || []);
        } else {
          setError(`Failed to load deals (status: ${response.status})`);
        }
      } catch (error) {
        console.error('Failed to fetch deals:', error);
        setError('Failed to connect to server. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--earth-bg)' }}
      >
        <div className="text-lg" style={{ color: 'var(--earth-muted)' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ backgroundColor: 'var(--earth-bg)' }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <h1
          className="text-3xl font-bold mb-8"
          style={{ fontFamily: '"Space Mono", monospace', color: 'var(--earth-text)' }}
        >
          Dashboard
        </h1>

        {/* Deals Section */}
        <section>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ fontFamily: '"Space Mono", monospace', color: 'var(--earth-subtle)' }}
          >
            Your Deals
          </h2>
          {error && (
            <div
              className="rounded-lg p-4 mb-4"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
              }}
            >
              {error}
            </div>
          )}

          {deals.length === 0 && !error ? (
            <p style={{ color: 'var(--earth-muted)' }}>No deals configured yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal) => (
                <DealCard
                  key={deal.id}
                  appsumoUrl={deal.appsumoUrl}
                  status={deal.status}
                  lastChecked={deal.lastChecked}
                />
              ))}
            </div>
          )}
        </section>

        {/* Events Section */}
        <section>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ fontFamily: '"Space Mono", monospace', color: 'var(--earth-subtle)' }}
          >
            Event Log
          </h2>
          <EventLog events={events} />
        </section>
      </div>
    </div>
  );
}
