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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

        {/* Deals Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Your Deals</h2>
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg p-4 mb-4">
              {error}
            </div>
          )}

          {deals.length === 0 && !error ? (
            <p className="text-gray-500">No deals configured yet.</p>
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
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Event Log</h2>
          <EventLog events={events} />
        </section>
      </div>
    </div>
  );
}