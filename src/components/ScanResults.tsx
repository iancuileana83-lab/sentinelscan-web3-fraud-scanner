import type { Scan } from '@/types';
import RiskGauge from './RiskGauge';
import AuditFindings from './AuditFindings';
import { AlertTriangle, CheckCircle2, ShieldAlert, FileSearch } from 'lucide-react';

interface ScanResultsProps {
  scan: Scan | null;
}

const levelBanner = {
  safe: {
    Icon: CheckCircle2,
    text: 'This project appears safe based on the available data. Always do your own research.',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    color: 'text-emerald-400',
  },
  caution: {
    Icon: ShieldAlert,
    text: 'Exercise caution. Several moderate risk factors were identified in this scan.',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    color: 'text-amber-400',
  },
  danger: {
    Icon: AlertTriangle,
    text: 'High risk detected. Strongly consider avoiding this project until red flags are resolved.',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    color: 'text-rose-400',
  },
} as const;

export default function ScanResults({ scan }: ScanResultsProps) {
  if (!scan) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
          <FileSearch size={28} className="text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-300 mb-1">
          No scan selected
        </h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Paste a URL or Terms of Service text above to run a new scan, or select
          a past scan from the sidebar.
        </p>
      </div>
    );
  }

  const banner = levelBanner[scan.riskLevel];

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Gauge */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-slate-800/30 border border-slate-700/40 rounded-2xl p-6 lg:w-80">
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            Risk Score
          </h3>
          <RiskGauge score={scan.riskScore} level={scan.riskLevel} />
        </div>

        {/* Summary + banner */}
        <div className="flex-1 flex flex-col gap-4">
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${banner.bg} ${banner.border}`}>
            <banner.Icon size={22} className={`flex-shrink-0 mt-0.5 ${banner.color}`} />
            <div>
              <p className={`text-sm font-semibold ${banner.color}`}>
                {banner.text}
              </p>
            </div>
          </div>
          <div className="p-4 bg-slate-800/30 border border-slate-700/40 rounded-xl">
            <h3 className="text-sm font-medium text-slate-400 mb-2">
              Scan Summary
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              {scan.summary}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono bg-slate-700/40 px-2 py-1 rounded">
                {scan.target}
              </span>
              <span>·</span>
              <span>{scan.findings.length} findings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Findings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileSearch size={18} className="text-emerald-400" />
          <h3 className="text-base font-semibold text-slate-100">
            AI Audit Findings
          </h3>
          <span className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
            {scan.findings.length} detected
          </span>
        </div>
        <AuditFindings findings={scan.findings} />
      </div>
    </div>
  );
}
