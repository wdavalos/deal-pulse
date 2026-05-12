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
      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
      >
        <p className="text-center" style={{ color: '#666666' }}>No events yet.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg"
      style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
    >
      {events.map((event, index) => (
        <div
          key={event.id}
          className="p-4 flex items-start gap-3"
          style={{
            borderTop: index > 0 ? '1px solid #222222' : undefined,
          }}
        >
          <span className="text-xl" role="img" aria-label={event.type}>
            {eventIcons[event.type] || '📋'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium capitalize" style={{ color: '#ffffff' }}>
              {event.type.replace('_', ' ')}
            </p>
            {event.details && (
              <p className="text-sm mt-1" style={{ color: '#888888' }}>
                {event.details}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: '#666666' }}>
              {new Date(event.occurredAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
