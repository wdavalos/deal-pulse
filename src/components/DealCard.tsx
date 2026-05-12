import { ExternalLink } from 'lucide-react';

interface DealCardProps {
  appsumoUrl: string;
  status: string;
  lastChecked: string | null;
}

export function DealCard({ appsumoUrl, status, lastChecked }: DealCardProps) {
  const isActive = status === 'active';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <a
          href={appsumoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium flex items-center gap-1 truncate"
          title={appsumoUrl}
        >
          {appsumoUrl}
          <ExternalLink size={14} />
        </a>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isActive
              ? 'bg-green-900/50 text-green-400 border border-green-800'
              : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}
        >
          {isActive ? 'Active' : status}
        </span>
      </div>

      {lastChecked && (
        <p className="text-xs text-gray-500">
          Last checked: {new Date(lastChecked).toLocaleString()}
        </p>
      )}
    </div>
  );
}