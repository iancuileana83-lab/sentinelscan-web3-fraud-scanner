import { navItems, type NavSection } from '@/lib/navItems';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface NavBarProps {
  active: NavSection;
  onSelect: (section: NavSection) => void;
}

export default function NavBar({ active, onSelect }: NavBarProps) {
  const [overflowOpen, setOverflowOpen] = useState(false);

  const visibleItems = navItems.slice(0, 5);
  const overflowItems = navItems.slice(5);

  const activeOverflow = overflowItems.find((i) => i.id === active);

  return (
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
      {visibleItems.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-slate-700/60 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <item.Icon size={15} />
            {item.label}
          </button>
        );
      })}

      {overflowItems.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setOverflowOpen((v) => !v)}
            onBlur={() => setTimeout(() => setOverflowOpen(false), 150)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              overflowOpen || activeOverflow
                ? 'bg-slate-700/60 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            More
            <ChevronDown
              size={14}
              className={`transition-transform ${overflowOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {overflowOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-slate-800 border border-slate-700/60 rounded-xl shadow-xl py-1 z-50">
              {overflowItems.map((item) => {
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelect(item.id);
                      setOverflowOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-left transition-colors ${
                      isActive
                        ? 'text-emerald-400 bg-slate-700/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                    }`}
                  >
                    <item.Icon size={15} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
