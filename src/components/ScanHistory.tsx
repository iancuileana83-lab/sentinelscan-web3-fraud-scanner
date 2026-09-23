import type { Scan } from '@/types';
import { Clock, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface ScanHistoryProps {
  scans: Scan[];
  activeId: string | null;
  onSelect: (scan: Scan) => void;
}

const levelIcon = {
  safe: { Icon: ShieldCheck, color: 'text-emerald-400' },
  caution: { Icon: ShieldAlert, color: 'text-amber-400' },
  danger: { Icon: ShieldX, color: 'text-rose-400' },
} as const;

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date('2026-09-04T15:00:00Z');
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) return 'just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

function shortTarget(target: string): string {
  try {
    const url = new URL(target);
    return url.hostname.replace('www.', '');
  } catch {
    return target.length > 28 ? target.slice(0, 28) + '...' : target;
  }
}

export default function ScanHistory({
  scans,
  activeId,
  onSelect,
}: ScanHistoryProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50">
        <Clock size={16} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-200">Recent Scans</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
          {scans.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {scans.map((scan) => {
          const { Icon, color } = levelIcon[scan.riskLevel];
          const isActive = scan.id === activeId;
          return (
            <button
              key={scan.id}
              onClick={() => onSelect(scan)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-slate-700/60 border border-slate-600/50'
                  : 'hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Icon size={18} className={`flex-shrink-0 ${color}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200 truncate">
                  {shortTarget(scan.target)}
                </div>
                <div className="text-xs text-slate-500">
                  {formatTime(scan.timestamp)} · Score {scan.riskScore}
                </div>
              </div>
              <div
                className={`flex-shrink-0 text-sm font-bold ${
                  scan.riskLevel === 'safe'
                    ? 'text-emerald-400'
                    : scan.riskLevel === 'caution'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {scan.riskScore}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
