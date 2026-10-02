import type { FindingCategory } from '@/types';
import {
  DollarSign,
  TrendingDown,
  Gavel,
  ShieldAlert,
  EyeOff,
  Landmark,
} from 'lucide-react';

const fallbackEntry = { Icon: ShieldAlert, color: 'text-slate-400' };

export const categoryIcon: Record<
  FindingCategory,
  { Icon: typeof DollarSign; color: string }
> = {
  'Hidden Fees': { Icon: DollarSign, color: 'text-amber-400' },
  'Rugpull Risk': { Icon: TrendingDown, color: 'text-rose-400' },
  'Jurisdiction Issues': { Icon: Gavel, color: 'text-orange-400' },
  'Contract Vulnerability': { Icon: ShieldAlert, color: 'text-red-400' },
  'Privacy Violation': { Icon: EyeOff, color: 'text-purple-400' },
  'Regulatory Compliance': { Icon: Landmark, color: 'text-sky-400' },
};

export function getCategoryIcon(category: string) {
  return (
    categoryIcon[category as FindingCategory] ??
    fallbackEntry
  );
}

const fallbackSeverity = {
  label: 'Unknown',
  color: 'text-slate-300',
  bg: 'bg-slate-500/10',
  border: 'border-slate-500/30',
};

export const severityConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  low: {
    label: 'Low',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  high: {
    label: 'High',
    color: 'text-orange-300',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  critical: {
    label: 'Critical',
    color: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
};

export function getSeverityConfig(severity: string) {
  return severityConfig[severity.toLowerCase()] ?? fallbackSeverity;
}
