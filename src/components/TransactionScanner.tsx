import { useState } from 'react';
import {
  ArrowLeftRight,
  Search,
  Loader2,
  AlertCircle,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Coins,
  Layers,
  Fuel,
  Hash,
  Clock,
  Building2,
  FileText,
} from 'lucide-react';
import RiskGauge from './RiskGauge';
import RiskExplainer from './RiskExplainer';
import {
  assessTxRisk,
  type TxData,
  type TxRiskAssessment,
} from '@/lib/txRisk';
import { explainTxRisk } from '@/lib/riskExplainer';
import { getSeverityConfig } from '@/lib/findingMeta';

type Network = 'ethereum' | 'base' | 'arbitrum' | 'solana';

const networks: { id: Network; label: string }[] = [
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'base', label: 'Base' },
  { id: 'arbitrum', label: 'Arbitrum' },
  { id: 'solana', label: 'Solana' },
];

const levelBanner = {
  safe: {
    Icon: CheckCircle2,
    text: 'Low risk profile based on available on-chain data. This does not guarantee the transaction is safe.',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    color: 'text-emerald-400',
  },
  caution: {
    Icon: ShieldAlert,
    text: 'Moderate risk indicators identified. Several factors warrant attention.',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    color: 'text-amber-400',
  },
  danger: {
    Icon: AlertTriangle,
    text: 'Multiple high-risk indicators detected. Patterns commonly associated with suspicious activity found.',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    color: 'text-rose-400',
  },
} as const;

function formatAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr || '—';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatTimestamp(ts: string): string {
  if (!ts) return '—';
  const num = Number(ts);
  if (!num) return ts;
  return new Date(num * 1000).toLocaleString();
}

function formatValue(value: string, decimals = 18): string {
  const num = Number(value);
  if (isNaN(num)) return value;
  return (num / Math.pow(10, decimals)).toLocaleString(undefined, {
    maximumFractionDigits: 4,
    maximumSignificantDigits: 6,
  });
}

function formatGas(gas: string): string {
  const num = Number(gas);
  if (isNaN(num)) return gas;
  return num.toLocaleString();
}

export default function TransactionScanner() {
  const [txHash, setTxHash] = useState('');
  const [network, setNetwork] = useState<Network>('ethereum');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txData, setTxData] = useState<TxData | null>(null);
  const [riskAssessment, setRiskAssessment] =
    useState<TxRiskAssessment | null>(null);

  const handleScan = async () => {
    if (!txHash.trim() || loading) return;
    setLoading(true);
    setError(null);
    setTxData(null);
    setRiskAssessment(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tx-scan`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          txHash: txHash.trim(),
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

      const data = body.data as TxData;
      setTxData(data);
      setRiskAssessment(assessTxRisk(data));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch transaction data';
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
          <ArrowLeftRight size={22} />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">
          Transaction Scanner
        </h2>
      </div>
      <p className="text-sm text-slate-400 mb-6 max-w-xl">
        Enter a transaction hash and select a network to fetch real on-chain
        transaction data and analyze it for suspicious patterns. Risk
        assessments are derived from on-chain data only and describe likelihood,
        not certainty.
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
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            placeholder={
              network === 'solana'
                ? 'Enter a Solana transaction signature (base58)'
                : 'Enter a transaction hash (e.g. 0x1234...abcd)'
            }
            className="w-full pl-12 pr-36 py-4 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-sm"
          />
          <button
            onClick={handleScan}
            disabled={!txHash.trim() || loading}
            className="absolute right-2 flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg text-sm transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Scanning
              </>
            ) : (
              <>Scan TX</>
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
            Fetching transaction data from{' '}
            {networks.find((n) => n.id === network)?.label}...
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Retrieving transaction details, token transfers, and internal calls
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
            Transaction Data Unavailable
          </h3>
          <p className="text-sm text-slate-500 max-w-md mb-1">{error}</p>
          <p className="text-xs text-slate-600 max-w-md">
            The blockchain explorer API may be rate-limited, the hash may be
            invalid, or the transaction may not exist on the selected network.
            Verify the hash and network, then try again.
          </p>
        </div>
      )}

      {/* Results */}
      {txData && riskAssessment && !loading && !error && (
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
                    <div>
                      <p className={`text-sm font-semibold ${banner.color} mb-1`}>
                        {banner.text}
                      </p>
                      <p className="text-xs text-slate-400">
                        {riskAssessment.summary}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Transaction overview stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                  <Hash size={16} className="text-emerald-400 mb-2" />
                  <div className="text-xs font-mono text-slate-200 truncate">
                    {formatAddress(txData.hash)}
                  </div>
                  <div className="text-xs text-slate-500">Block #{txData.blockNumber.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                  <Clock size={16} className="text-sky-400 mb-2" />
                  <div className="text-xs text-slate-200">
                    {formatTimestamp(txData.timeStamp)}
                  </div>
                  <div className="text-xs text-slate-500">Timestamp</div>
                </div>
                <div className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                  <Fuel size={16} className="text-amber-400 mb-2" />
                  <div className="text-sm font-bold text-slate-100">
                    {formatGas(txData.gasUsed)}
                  </div>
                  <div className="text-xs text-slate-500">Gas Used</div>
                </div>
                <div className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                  {txData.isSuccess ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-400 mb-2" />
                      <div className="text-sm font-bold text-emerald-400">
                        Success
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-rose-400 mb-2" />
                      <div className="text-sm font-bold text-rose-400">
                        Failed
                      </div>
                    </>
                  )}
                  <div className="text-xs text-slate-500">Status</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction details */}
          <div className="p-5 bg-slate-800/30 border border-slate-700/40 rounded-xl">
            <h3 className="text-sm font-medium text-slate-400 mb-3">
              Transaction Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-20 flex-shrink-0">From</span>
                <code className="text-xs font-mono text-slate-200 bg-slate-700/40 px-2 py-1 rounded">
                  {txData.from || '—'}
                </code>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-20 flex-shrink-0">To</span>
                <code className="text-xs font-mono text-slate-200 bg-slate-700/40 px-2 py-1 rounded">
                  {txData.to || '— (contract deployment)'}
                </code>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-20 flex-shrink-0">Value</span>
                <span className="text-sm text-slate-200 font-mono">
                  {formatValue(txData.value)} {txData.network === 'solana' ? 'SOL' : 'ETH'}
                </span>
              </div>
              {txData.functionName && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-20 flex-shrink-0">Function</span>
                  <code className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded">
                    {txData.functionName}
                  </code>
                </div>
              )}
              {txData.contractAddress && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-20 flex-shrink-0">Contract</span>
                  <code className="text-xs font-mono text-slate-200 bg-slate-700/40 px-2 py-1 rounded">
                    {txData.contractAddress}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Risk factors */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={18} className="text-emerald-400" />
              <h3 className="text-base font-semibold text-slate-100">
                Risk Factors
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
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium">Score contribution:</span>
                        <span className="text-slate-300">
                          +{factor.weight} points
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Risk Explanation */}
          <RiskExplainer
            explanation={explainTxRisk(txData, riskAssessment)}
            type="transaction"
          />

          {/* Suspicious addresses */}
          {riskAssessment.suspiciousAddresses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-rose-400" />
                <h3 className="text-base font-semibold text-slate-100">
                  Suspicious Addresses
                </h3>
                <span className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
                  {riskAssessment.suspiciousAddresses.length} found
                </span>
              </div>
              <div className="space-y-2">
                {riskAssessment.suspiciousAddresses.map((item, i) => (
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

          {/* Token transfers */}
          {txData.tokenTransfers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Coins size={18} className="text-amber-400" />
                <h3 className="text-base font-semibold text-slate-100">
                  Token Transfers
                </h3>
                <span className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
                  {txData.tokenTransfers.length} transfers
                </span>
              </div>
              <div className="space-y-2">
                {txData.tokenTransfers.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl"
                  >
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <ChevronRight size={14} className="rotate-90" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-200">
                        {t.tokenName} ({t.tokenSymbol})
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatAddress(t.from)} → {formatAddress(t.to)}
                      </div>
                    </div>
                    <div className="text-sm text-slate-300 font-mono flex-shrink-0">
                      {formatValue(t.value, Number(t.tokenDecimal) || 18)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal transactions */}
          {txData.internalTxs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Layers size={18} className="text-sky-400" />
                <h3 className="text-base font-semibold text-slate-100">
                  Internal Transactions
                </h3>
                <span className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
                  {txData.internalTxs.length} calls
                </span>
              </div>
              <div className="space-y-2">
                {txData.internalTxs.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl"
                  >
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                      <ArrowRight size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-slate-200 truncate">
                        {formatAddress(t.from)} → {formatAddress(t.to)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Type: {t.type || 'call'}
                      </div>
                    </div>
                    {Number(t.value) > 0 && (
                      <div className="text-sm text-slate-300 font-mono flex-shrink-0">
                        {formatValue(t.value)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input data */}
          {txData.input && txData.input !== '0x' && txData.input.length > 4 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-slate-400" />
                <h3 className="text-base font-semibold text-slate-100">
                  Input Data
                </h3>
                <span className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
                  {Math.round(txData.input.length / 2)} bytes
                </span>
              </div>
              <pre className="p-4 bg-slate-900 border border-slate-700/40 rounded-xl overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed max-h-48">
                {txData.input.length > 500
                  ? `${txData.input.slice(0, 500)}...`
                  : txData.input}
              </pre>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-4 bg-slate-800/20 border border-slate-700/30 rounded-xl">
            <Building2 size={18} className="flex-shrink-0 text-slate-500 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              This risk assessment is derived solely from on-chain transaction
              data retrieved from public blockchain explorers. It describes
              risk factors and likelihood based on observed patterns — it does
              not constitute proof of fraud, nor does the absence of risk
              factors guarantee safety. Always conduct additional due diligence
              for high-value transactions.
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !txData && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
            <ArrowLeftRight size={28} className="text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-1">
            Enter a Transaction Hash
          </h3>
          <p className="text-sm text-slate-500 max-w-xs">
            Paste a transaction hash above, select a network, and click Scan TX
            to fetch real on-chain data and a transparent risk assessment.
          </p>
        </div>
      )}
    </div>
  );
}
