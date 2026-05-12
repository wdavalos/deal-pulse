interface EventLogProps {
  events: {
    id: string;
    type: string;
    details: string | null;
    occurredAt: string;
  }[];
}

const eventIcons: Record<string, string> = {
  live: '🎉',
  tier_filled: '⚠️',
  expired: '❌',
};

export function EventLog({ events }: EventLogProps) {
  if (events.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <p className="text-gray-500 text-center">No events yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg divide-y divide-gray-800">
      {events.map((event) => (
        <div key={event.id} className="p-4 flex items-start gap-3">
          <span className="text-xl" role="img" aria-label={event.type}>
            {eventIcons[event.type] || '📋'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-gray-200 font-medium capitalize">{event.type.replace('_', ' ')}</p>
            {event.details && (
              <p className="text-gray-400 text-sm mt-1">{event.details}</p>
            )}
            <p className="text-gray-600 text-xs mt-1">
              {new Date(event.occurredAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}