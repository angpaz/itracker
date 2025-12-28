
import React from 'react';
import { MarketAnalysis } from '../types';

interface SearchStatsProps {
  analysis: MarketAnalysis | null;
  isLoading: boolean;
  agentEnabled?: boolean;
}

const SearchStats: React.FC<SearchStatsProps> = ({ analysis, isLoading, agentEnabled = false }) => {
  if (isLoading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-zinc-900 rounded-xl border border-zinc-800" />)}
    </div>
  );

  if (!analysis) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Avg Market Price</span>
        <div className="text-2xl font-black text-white">€{analysis.averagePrice}</div>
        <div className="flex items-center gap-1 mt-1">
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-bold text-zinc-600 uppercase">Live Sample</span>
        </div>
      </div>

      <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Listings Filtered</span>
        <div className="text-2xl font-black text-white">{analysis.listings.length}</div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[9px] font-bold text-zinc-600 uppercase">Current Session</span>
        </div>
      </div>

      {agentEnabled && (
        <>
          <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1">Arbitrage Spread</span>
            <div className="text-2xl font-black text-emerald-400">
              {analysis.arbitrageSpread > 0 ? '+' : ''}€{analysis.arbitrageSpread}
            </div>
            <p className="text-[9px] text-emerald-600 font-bold uppercase mt-1">vs Retail Floor</p>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 overflow-hidden relative">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Market Sentiment</span>
            <div className="text-sm font-black text-white mt-1 leading-tight">
              {analysis.averagePrice < analysis.backMarketPrice ? 'BUY SIGNAL' : 'NEUTRAL'}
            </div>
            <div className="absolute right-[-10px] bottom-[-10px] text-zinc-800 opacity-20 transform rotate-12">
               <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 11.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/></svg>
            </div>
          </div>
        </>
      )}

      {/* Grounding sources list required by guidelines when using googleSearch */}
      {analysis.sources && analysis.sources.length > 0 && (
        <div className="col-span-full mt-2 p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-2">Grounding Sources</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {analysis.sources.map((s, i) => (
              <a 
                key={i} 
                href={s.uri} 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] text-emerald-500/80 hover:text-emerald-400 font-bold flex items-center gap-1 transition-colors"
              >
                <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="truncate max-w-[200px]">{s.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchStats;
