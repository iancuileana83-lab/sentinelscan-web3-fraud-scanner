import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  ShieldCheck,
  History,
  Building2,
  Code2,
  HelpCircle,
} from 'lucide-react';

export type NavSection =
  | 'dashboard'
  | 'wallet'
  | 'transactions'
  | 'reports'
  | 'history'
  | 'businesses'
  | 'api'
  | 'how-it-works';

export const navItems: {
  id: NavSection;
  label: string;
  Icon: typeof LayoutDashboard;
}[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'wallet', label: 'Wallet Scanner', Icon: Wallet },
  { id: 'transactions', label: 'Transaction Scanner', Icon: ArrowLeftRight },
  { id: 'reports', label: 'Security Reports', Icon: ShieldCheck },
  { id: 'history', label: 'Scan History', Icon: History },
  { id: 'businesses', label: 'For Businesses', Icon: Building2 },
  { id: 'api', label: 'API', Icon: Code2 },
  { id: 'how-it-works', label: 'How It Works', Icon: HelpCircle },
];
