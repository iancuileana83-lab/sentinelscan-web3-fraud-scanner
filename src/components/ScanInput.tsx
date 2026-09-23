import { useState } from 'react';
import { Search, FileText, Link2, Loader2 } from 'lucide-react';

interface ScanInputProps {
  onScan: (input: string) => void;
  isScanning: boolean;
}

export default function ScanInput({ onScan, isScanning }: ScanInputProps) {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<'url' | 'text'>('url');

  const handleSubmit = () => {
    if (!value.trim() || isScanning) return;
    onScan(value.trim());
  };

  return (
    <div className="w-full">
      <div className="flex gap-1 mb-3 p-1 bg-slate-800/60 rounded-xl border border-slate-700/50 w-fit">
        <button
          onClick={() => setMode('url')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'url'
              ? 'bg-slate-700 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Link2 size={16} />
          URL
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'text'
              ? 'bg-slate-700 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText size={16} />
          ToS Text
        </button>
      </div>

      <div className="relative flex items-center">
        <Search
          size={20}
          className="absolute left-4 text-slate-500 pointer-events-none"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={
            mode === 'url'
              ? 'Paste a Web3 project URL (e.g. https://example.io)'
              : 'Paste raw Terms of Service text to analyze...'
          }
          className="w-full pl-12 pr-36 py-4 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isScanning}
          className="absolute right-2 flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg text-sm transition-all active:scale-95"
        >
          {isScanning ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Scanning
            </>
          ) : (
            <>Scan</>
          )}
        </button>
      </div>
    </div>
  );
}
