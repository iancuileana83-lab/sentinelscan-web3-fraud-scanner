import type { Finding } from '@/types';
import { getCategoryIcon, getSeverityConfig } from '@/lib/findingMeta';
import { ChevronRight } from 'lucide-react';

interface AuditFindingsProps {
  findings: Finding[];
}

export default function AuditFindings({ findings }: AuditFindingsProps) {
  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <p className="text-sm">No findings detected for this scan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {findings.map((finding) => {
        const { Icon, color } = getCategoryIcon(finding.category);
        const sev = getSeverityConfig(finding.severity);
        return (
          <div
            key={finding.id}
            className="group flex items-start gap-4 p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl hover:border-slate-600/60 hover:bg-slate-800/70 transition-all cursor-default"
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-lg bg-slate-700/40 flex items-center justify-center ${color}`}
            >
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="text-sm font-semibold text-slate-100">
                  {finding.title}
                </h4>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${sev.bg} ${sev.border} ${sev.color}`}
                >
                  {sev.label}
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                {finding.description}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                <span className="font-medium">{finding.category}</span>
                <ChevronRight size={12} />
                <span>Smart Contract & Legal Analysis</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
