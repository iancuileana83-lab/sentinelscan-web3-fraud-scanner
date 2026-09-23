import { useState } from 'react';
import { ShieldCheck, Activity, Menu, X, AlertCircle } from 'lucide-react';
import type { Scan, RiskLevel, FindingCategory } from '@/types';
import { dummyScans } from '@/data/dummyData';
import ScanInput from '@/components/ScanInput';
import ScanResults from '@/components/ScanResults';
import ScanHistory from '@/components/ScanHistory';
import NavBar from '@/components/NavBar';
import type { NavSection } from '@/lib/navItems';
import WalletScanner from '@/components/WalletScanner';
import TransactionScanner from '@/components/TransactionScanner';
import {
  SecurityReports,
  ForBusinesses,
  ApiPage,
  HowItWorks,
} from '@/components/NavPages';

const API_URL =
  'https://web3-fraud-shield-30747896454.europe-west4.run.app/api/scan';

interface ApiResponse {
  score: number;
  level: string;
  summary: string;
  findings: {
    category: string;
    title: string;
    description: string;
    severity: string;
  }[];
}

function normalizeLevel(level: string): RiskLevel {
  const l = level.toLowerCase();
  if (l.includes('safe') || l.includes('low') || l === 'green') return 'safe';
  if (l.includes('caution') || l.includes('medium') || l === 'yellow')
    return 'caution';
  return 'danger';
}

function normalizeCategory(category: string): FindingCategory {
  const known: FindingCategory[] = [
    'Hidden Fees',
    'Rugpull Risk',
    'Jurisdiction Issues',
    'Contract Vulnerability',
    'Privacy Violation',
    'Regulatory Compliance',
  ];
  const match = known.find(
    (k) => k.toLowerCase() === category.toLowerCase()
  );
  return match ?? ('Regulatory Compliance' as FindingCategory);
}

function normalizeSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
  const s = severity.toLowerCase().trim();
  if (s === 'low' || s === 'medium' || s === 'high' || s === 'critical') return s;
  if (s.includes('crit')) return 'critical';
  if (s.includes('high')) return 'high';
  if (s.includes('med')) return 'medium';
  return 'low';
}

async function callScanApi(input: string): Promise<Scan> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text_content: input }),
  });

  if (!res.ok) {
    throw new Error(`Backend returned ${res.status}`);
  }

  const data: ApiResponse = await res.json();
  const level = normalizeLevel(data.level);

  return {
    id: crypto.randomUUID(),
    target: input,
    type: 'url',
    timestamp: new Date().toISOString(),
    riskScore: data.score,
    riskLevel: level,
    summary: data.summary,
    findings: (data.findings ?? []).map((f, i) => ({
      id: `api-finding-${i}`,
      category: normalizeCategory(f.category),
      title: f.title,
      description: f.description,
      severity: normalizeSeverity(f.severity),
    })),
  };
}

function App() {
  const [scans, setScans] = useState<Scan[]>(dummyScans);
  const [activeScan, setActiveScan] = useState<Scan | null>(dummyScans[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navSection, setNavSection] = useState<NavSection>('dashboard');

  const handleScan = async (input: string) => {
    setIsScanning(true);
    setScanError(null);
    try {
      const newScan = await callScanApi(input);
      setScans((prev) => [newScan, ...prev]);
      setActiveScan(newScan);
    } catch {
      setScanError(
        'Could not reach the scan engine. Check your connection and try again.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const renderNavContent = () => {
    switch (navSection) {
      case 'wallet':
        return <WalletScanner />;
      case 'transactions':
        return <TransactionScanner />;
      case 'reports':
        return <SecurityReports />;
      case 'history':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-100 mb-1">
              Scan History
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              All past scans across your account. Click any entry to view its
              full risk report.
            </p>
            <div className="space-y-2">
              {scans.map((scan) => (
                <button
                  key={scan.id}
                  onClick={() => {
                    setActiveScan(scan);
                    setNavSection('dashboard');
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl hover:border-slate-600/60 hover:bg-slate-800/70 transition-all text-left"
                >
                  <div
                    className={`flex-shrink-0 w-2 h-12 rounded-full ${
                      scan.riskLevel === 'safe'
                        ? 'bg-emerald-500'
                        : scan.riskLevel === 'caution'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">
                      {scan.target}
                    </div>
                    <div className="text-xs text-slate-500">
                      {scan.findings.length} findings ·{' '}
                      {new Date(scan.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    className={`flex-shrink-0 text-lg font-bold ${
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
              ))}
            </div>
          </div>
        );
      case 'businesses':
        return <ForBusinesses />;
      case 'api':
        return <ApiPage />;
      case 'how-it-works':
        return <HowItWorks />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ShieldCheck size={20} className="text-slate-950" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight">
                  SentinelScan
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Web3 Fraud & Compliance Scanner
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50">
              <Activity size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">Engine Online</span>
            </span>
          </div>
        </div>

        {/* Navigation bar */}
        <div className="px-4 lg:px-6 pb-2 hidden md:block">
          <NavBar active={navSection} onSelect={setNavSection} />
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden border-b border-slate-800 bg-slate-900/60 px-4 py-2">
        <NavBar active={navSection} onSelect={setNavSection} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — only on Dashboard */}
        {navSection === 'dashboard' && (
          <>
            <aside
              className={`${
                sidebarOpen ? 'fixed inset-y-0 left-0 z-40 mt-16' : 'hidden'
              } lg:relative lg:block lg:mt-0 lg:inset-auto w-72 flex-shrink-0 bg-slate-900/60 border-r border-slate-800`}
            >
              <ScanHistory
                scans={scans}
                activeId={activeScan?.id ?? null}
                onSelect={(s) => {
                  setActiveScan(s);
                  setSidebarOpen(false);
                }}
              />
            </aside>

            {sidebarOpen && (
              <div
                className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {navSection === 'dashboard' ? (
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Input section */}
              <section>
                <h2 className="text-xl font-bold text-slate-100 mb-1">
                  Run a New Scan
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Paste a Web3 project URL or raw Terms of Service text to analyze
                  for fraud and compliance risks.
                </p>
                <ScanInput onScan={handleScan} isScanning={isScanning} />
              </section>

              {/* Results section */}
              <section>
                {scanError && !isScanning && (
                  <div className="flex items-start gap-3 p-4 mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10">
                    <AlertCircle size={20} className="flex-shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-rose-300">
                        {scanError}
                      </p>
                    </div>
                  </div>
                )}
                {isScanning ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                    </div>
                    <p className="text-sm font-medium text-slate-300">
                      Analyzing contract and legal documents...
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Running AI audit across 6 risk categories
                    </p>
                  </div>
                ) : (
                  <ScanResults scan={activeScan} />
                )}
              </section>
            </div>
          ) : (
            <div className="py-4">{renderNavContent()}</div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
