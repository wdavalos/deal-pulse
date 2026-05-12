import { ExternalLink } from 'lucide-react';

interface DealCardProps {
  appsumoUrl: string;
  status: string;
  lastChecked: string | null;
}

export function DealCard({ appsumoUrl, status, lastChecked }: DealCardProps) {
  const isActive = status === 'active';

  return (
    <div
      className="rounded-lg p-4 space-y-3"
      style={{
        backgroundColor: '#111111',
        border: isActive ? '1px solid #b45309' : '1px solid #222222',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <a
          href={appsumoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-sm font-medium flex items-center gap-1 truncate"
          style={{ color: '#b45309' }}
          title={appsumoUrl}
        >
          {appsumoUrl}
          <ExternalLink size={14} />
        </a>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          style={
            isActive
              ? { backgroundColor: 'rgba(180, 83, 9, 0.2)', color: '#b45309', border: '1px solid rgba(180, 83, 9, 0.3)' }
              : { backgroundColor: '#111111', color: '#666666', border: '1px solid #222222' }
          }
        >
          {isActive ? 'Active' : status}
        </span>
      </div>

      {lastChecked && (
        <p className="text-xs" style={{ color: '#666666' }}>
          Last checked: {new Date(lastChecked).toLocaleString()}
        </p>
      )}
    </div>
  );
}
