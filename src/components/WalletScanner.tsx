import { useState } from 'react';
import {
  Wallet,
  Search,
  Loader2,
  AlertCircle,
  ArrowRight,
  Activity,
  Coins,
  Building2,
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import RiskGauge from './RiskGauge';
import RiskExplainer from './RiskExplainer';
import {
  assessWalletRisk,
  type WalletData,
  type WalletRiskAssessment,
} from '@/lib/walletRisk';
import { explainWalletRisk } from '@/lib/riskExplainer';
import { getSeverityConfig } from '@/lib/findingMeta';

type Network = 'ethereum' | 'base' | 'arbitrum' | 'solana';

const networks: { id: Network; label: string; symbol: string }[] = [
  { id: 'ethereum', label: 'Ethereum', symbol: 'ETH' },
  { id: 'base', label: 'Base', symbol: 'BASE' },
  { id: 'arbitrum', label: 'Arbitrum', symbol: 'ARB' },
  { id: 'solana', label: 'Solana', symbol: 'SOL' },
];

const levelBanner = {
  safe: {
    Icon: CheckCircle2,
    text: 'This wallet shows a low-risk activity profile based on on-chain data.',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    color: 'text-emerald-400',
  },
  caution: {
    Icon: ShieldAlert,
    text: 'Exercise caution. Several moderate risk indicators were identified in this wallet activity.',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    color: 'text-amber-400',
  },
  danger: {
    Icon: AlertTriangle,
    text: 'High risk detected. Multiple suspicious patterns found in this wallet transaction history.',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    color: 'text-rose-400',
  },
} as const;

function formatAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatTimestamp(ts: string): string {
  if (!ts) return '—';
  const num = Number(ts);
  if (!num) return ts;
  return new Date(num * 1000).toLocaleString();
}

function formatValue(value: string, decimals: string): string {
  const num = Number(value);
  if (isNaN(num)) return value;
  const d = Number(decimals) || 18;
  return (num / Math.pow(10, d)).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  maximumSignificantDigits: 6,
  });
}

export default function WalletScanner() {
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState<Network>('ethereum');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [riskAssessment, setRiskAssessment] =
    useState<WalletRiskAssessment | null>(null);

  const handleScan = async () => {
    if (!address.trim() || loading) return;
    setLoading(true);
    setError(null);
    setWalletData(null);
    setRiskAssessment(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wallet-scan`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          address: address.trim(),
          network,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      const body = await res.json();
      if (body.error) {
        throw new Error(body.error);
      }
      if (!body.data) {
        throw new Error('No data returned from the scan service');
      }

      const data = body.data as WalletData;
      setWalletData(data);
      setRiskAssessment(assessWalletRisk(data));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch wallet data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-emerald-400">
          <Wallet size={22} />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Wallet Scanner</h2>
      </div>
      <p className="text-sm text-slate-400 mb-6 max-w-xl">
        Enter a wallet address and select a network to fetch real on-chain
        data — transaction history, token holdings, and contract interactions —
        and assess the wallet risk profile.
      </p>

      {/* Input */}
      <div className="mb-6">
        <div className="flex gap-1 mb-3 p-1 bg-slate-800/60 rounded-xl border border-slate-700/50 w-fit">
          {networks.map((n) => (
            <button
              key={n.id}
              onClick={() => setNetwork(n.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                network === n.id
                  ? 'bg-slate-700 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>

        <div className="relative flex items-center">
          <Search
            size={20}
            className="absolute left-4 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            placeholder={
              network === 'solana'
                ? 'Enter a Solana wallet address (e.g. 7xKXt... or base58 address)'
                : 'Enter a wallet address (e.g. 0x1234...abcd)'
            }
            className="w-full pl-12 pr-36 py-4 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-sm"
          />
          <button
            onClick={handleScan}
            disabled={!address.trim() || loading}
            className="absolute right-2 flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg text-sm transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Scanning
              </>
            ) : (
              <>Scan Wallet</>
            )}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-300">
            Fetching on-chain data from{' '}
            {networks.find((n) => n.id === network)?.label}...
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Retrieving transactions, token holdings, and contract interactions
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
            <AlertCircle size={28} className="text-rose-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            Data Unavailable
          </h3>
          <p className="text-sm text-slate-500 max-w-md mb-1">{error}</p>
          <p className="text-xs text-slate-600 max-w-md">
            The blockchain explorer API may be rate-limited, the address may be
            invalid, or the API key may not be configured. Try again or use a
            different address.
          </p>
        </div>
      )}

      {/* Results */}
      {walletData && riskAssessment && !loading && !error && (
        <div className="space-y-6">
          {/* Risk gauge + banner */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-shrink-0 flex flex-col items-center justify-center bg-slate-800/30 border border-slate-700/40 rounded-2xl p-6 lg:w-80">
              <h3 className="text-sm font-medium text-slate-400 mb-2">
                Risk Score
              </h3>
              <RiskGauge
                score={riskAssessment.score}
                level={riskAssessment.level}
              />
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {(() => {
                const banner = levelBanner[riskAssessment.level];
                return (
                  <div
                    className={`flex items-start gap-3 p-4 rounded-xl border ${banner.bg} ${banner.border}`}
                  >
                    <banner.Icon
                      size={22}
                      className={`flex-shrink-0 mt-0.5 ${banner.color}`}
                    />
                    <p className={`text-sm font-semibold ${banner.color}`}>
                      {banner.text}
                    </p>
                  </div>
                );
              })()}

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                  <Activity
                    size={16}
                    className="text-emerald-400 mb-2"
                  />
                  <div className="text-xl font-bold text-slate-100">
                    {walletData.txCount}
                  </div>
                  <div className="text-xs text-slate-500">Transactions</div>
                </div>
                <div className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                  <Coins size={16} className="text-amber-400 mb-2" />
                  <div className="text-xl font-bold text-slate-100">
                    {walletData.tokenCount}
                  </div>
                  <div className="text-xs text-slate-500">Tokens Held</div>
                </div>
                <div className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                  <Building2
                    size={16}
                    className="text-sky-400 mb-2"
                  />
                  <div className="text-xl font-bold text-slate-100">
                    {walletData.contractInteractions.length}
                  </div>
                  <div className="text-xs text-slate-500">
                    Counterparties
                  </div>
                </div>
                <div className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                  <Clock size={16} className="text-slate-400 mb-2" />
                  <div className="text-xs font-medium text-slate-300">
                    {walletData.firstSeen
                      ? new Date(walletData.firstSeen).toLocaleDateString()
                      : '—'}
                  </div>
                  <div className="text-xs text-slate-500">First Seen</div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk factors */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={18} className="text-emerald-400" />
              <h3 className="text-base font-semibold text-slate-100">
                Key Risk Factors
              </h3>
              <span className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
                {riskAssessment.riskFactors.length} detected
              </span>
            </div>
            <div className="space-y-3">
              {riskAssessment.riskFactors.map((factor, i) => {
                const sev = getSeverityConfig(factor.severity);
                return (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl"
                  >
                    <div
                      className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full border ${sev.bg} ${sev.border} ${sev.color}`}
                    >
                      {sev.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-100 mb-1">
                        {factor.title}
                      </h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {factor.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Risk Explanation */}
          <RiskExplainer
            explanation={explainWalletRisk(walletData, riskAssessment)}
            type="wallet"
          />

          {/* Suspicious interactions */}
          {riskAssessment.suspiciousInteractions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-rose-400" />
                <h3 className="text-base font-semibold text-slate-100">
                  Suspicious Interactions
                </h3>
                <span className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
                  {riskAssessment.suspiciousInteractions.length} found
                </span>
              </div>
              <div className="space-y-2">
                {riskAssessment.suspiciousInteractions.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl"
                  >
                    <code className="text-xs font-mono text-rose-300 bg-rose-500/10 px-2 py-1 rounded">
                      {formatAddress(item.address)}
                    </code>
                    <span className="text-sm text-slate-400">{item.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suspicious contracts */}
          {riskAssessment.suspiciousContracts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={18} className="text-amber-400" />
                <h3 className="text-base font-semibold text-slate-100">
                  Suspicious Contracts
                </h3>
                <span className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
                  {riskAssessment.suspiciousContracts.length} found
                </span>
              </div>
              <div className="space-y-2">
                {riskAssessment.suspiciousContracts.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl"
                  >
                    <code className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2 py-1 rounded">
                      {formatAddress(item.address)}
                    </code>
                    <span className="text-sm text-slate-400">{item.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Token holdings */}
          {walletData.tokens.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Coins size={18} className="text-emerald-400" />
                <h3 className="text-base font-semibold text-slate-100">
                  Token Holdings
                </h3>
                <span className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
                  {walletData.tokens.length} tokens
                </span>
              </div>
              <div className="space-y-2">
                {walletData.tokens.map((token, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-200">
                        {token.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {token.symbol}
                      </div>
                    </div>
                    <div className="text-sm text-slate-300 font-mono">
                      {formatValue(token.balance, token.decimals)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent transactions */}
          {walletData.transactions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ArrowRight size={18} className="text-emerald-400" />
                <h3 className="text-base font-semibold text-slate-100">
                  Recent Transactions
                </h3>
                <span className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
                  {walletData.transactions.length} shown
                </span>
              </div>
              <div className="space-y-2">
                {walletData.transactions.map((tx, i) => {
                  const isOutgoing =
                    tx.from.toLowerCase() ===
                    walletData.address.toLowerCase();
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl"
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                          isOutgoing
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {isOutgoing ? (
                          <ArrowRight size={14} />
                        ) : (
                          <ChevronRight size={14} className="rotate-180" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-mono text-slate-300 truncate">
                          {formatAddress(tx.hash)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {isOutgoing ? 'To' : 'From'}{' '}
                          {formatAddress(isOutgoing ? tx.to : tx.from)}
                          {tx.functionName
                            ? ` · ${tx.functionName}`
                            : ''}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm text-slate-300 font-mono">
                          {formatValue(tx.value, '18')}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatTimestamp(tx.timeStamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contract interactions */}
          {walletData.contractInteractions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={18} className="text-sky-400" />
                <h3 className="text-base font-semibold text-slate-100">
                  Contract Interactions
                </h3>
                <span className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
                  {walletData.contractInteractions.length} addresses
                </span>
              </div>
              <div className="space-y-2">
                {walletData.contractInteractions.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl"
                  >
                    <code className="text-xs font-mono text-slate-300 flex-1 truncate">
                      {formatAddress(c.address)}
                    </code>
                    <span className="text-sm text-slate-400">
                      {c.count} tx
                      {c.count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !walletData && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
            <Wallet size={28} className="text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-1">
            Enter a Wallet Address
          </h3>
          <p className="text-sm text-slate-500 max-w-xs">
            Paste a wallet address above, select a network, and click Scan Wallet
            to fetch real on-chain data and risk analysis.
          </p>
        </div>
      )}
    </div>
  );
}
