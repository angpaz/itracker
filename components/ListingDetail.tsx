
import React from 'react';
import { iPhoneListing } from '../types';

interface ListingDetailProps {
  listing: iPhoneListing;
  marketAvg: number;
  retailBench: number;
  onClose: () => void;
}

const ListingDetail: React.FC<ListingDetailProps> = ({ listing, marketAvg, retailBench, onClose }) => {
  const profitMarginPercent = Math.min(100, Math.max(0, (listing.profitPotential / 200) * 100));
  const velocityScore = Math.min(100, Math.max(0, 100 - (listing.priceNum / marketAvg) * 50));
  
  return (
    <div className="h-full flex flex-col bg-[#0f0f11] animate-in fade-in slide-in-from-right duration-500">
      {/* Header Bar */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Alpha Intelligence</span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">ID: {listing.id.slice(-6)}</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight leading-tight line-clamp-1">{listing.title}</h2>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-500 transition-colors border border-zinc-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Main Workspace Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-terminal">
        {/* Core Indicators Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800 relative overflow-hidden group">
            <div className="text-[9px] font-black text-zinc-500 uppercase mb-2 tracking-widest">Est. Net Profit</div>
            <div className="text-3xl font-black text-emerald-500 flex items-baseline gap-1">
              €{listing.profitPotential}
              <span className="text-[10px] text-emerald-600 uppercase font-bold">ROI</span>
            </div>
            <div className="w-full bg-zinc-800 h-1 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" 
                style={{ width: `${profitMarginPercent}%` }} 
              />
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
            <div className="text-[9px] font-black text-zinc-500 uppercase mb-2 tracking-widest">Deal Velocity</div>
            <div className={`text-3xl font-black ${velocityScore > 70 ? 'text-blue-400' : 'text-zinc-400'}`}>
              {Math.round(velocityScore)}%
            </div>
            <div className="flex items-center gap-1 mt-2">
               <span className="text-[9px] font-bold text-zinc-600 uppercase">Predicted sell time: &lt; 24h</span>
            </div>
          </div>
        </div>

        {/* Spec Scan Results */}
        <section>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Diagnostic Payload</h3>
             <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-tighter">Verified by Gemini 3 Pro</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Storage', val: listing.storageGb || '?? GB', color: 'text-zinc-200' },
              { label: 'Battery', val: listing.batteryHealth || '?? %', color: parseInt(listing.batteryHealth || '0') > 90 ? 'text-emerald-400' : 'text-zinc-200' },
              { label: 'Pricing', val: listing.isVb ? 'VB' : 'FIX', color: listing.isVb ? 'text-amber-500' : 'text-zinc-400' }
            ].map(spec => (
              <div key={spec.label} className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 group hover:border-zinc-600 transition-colors">
                <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1">{spec.label}</span>
                <span className={`text-sm font-black uppercase tracking-tight ${spec.color}`}>{spec.val}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Flip Arbitrage Strategy Table */}
        <section className="bg-zinc-900/30 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Arbitrage Benchmarking</h3>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded uppercase">Deep Scanned</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-zinc-500">Current Listing Price</span>
                <span className="text-sm font-black text-white">{listing.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-zinc-500">Regional Market Avg</span>
                <span className="text-sm font-black text-zinc-400">€{marketAvg}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-zinc-500">Retail Refurb Base</span>
                <span className="text-sm font-black text-zinc-400">€{retailBench}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Margin vs Retail</span>
                  <span className="text-sm font-black text-emerald-400">€{retailBench - listing.priceNum}</span>
               </div>
               <p className="text-[9px] text-zinc-600 leading-tight italic">
                 Calculated ROI is based on instant re-listing at "Excellent" condition benchmarks.
               </p>
            </div>
          </div>
        </section>

        {/* Tactical AI Roadmap */}
        <section>
          <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Tactical Engagement Roadmap</h3>
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 relative">
            <div className="absolute top-4 right-4 animate-pulse">
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </div>
            
            <div className="space-y-6">
               <div className="relative pl-8 border-l border-zinc-800">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-zinc-700" />
                  <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Step 1: Negotiation Floor</span>
                  <p className="text-xs text-zinc-300 font-medium">
                    Initiate contact with a cash-pickup offer of <span className="text-emerald-500">€{Math.round(listing.priceNum * 0.9)}</span>. Use the "Battery Health" metric as leverage.
                  </p>
               </div>

               <div className="relative pl-8 border-l border-zinc-800">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-zinc-700" />
                  <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Step 2: Risk Mitigation</span>
                  <p className="text-xs text-zinc-300 font-medium italic">
                    {listing.sellerInsights || "Conduct on-site diagnosis: verify screen authenticity and FaceID functionality before final transaction."}
                  </p>
               </div>

               <div className="relative pl-8 border-l border-zinc-800">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-zinc-700" />
                  <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Step 3: Arbitrage Exit</span>
                  <p className="text-xs text-zinc-300 font-medium">
                    Clean unit, re-photograph in studio light, and list on alternate platforms for <span className="text-blue-400">€{Math.round(retailBench * 0.95)}</span>.
                  </p>
               </div>
            </div>
          </div>
        </section>
      </div>

      {/* Persistent Combat Controls */}
      <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-xl flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <a 
            href={listing.url} 
            target="_blank" 
            rel="noopener"
            className="flex items-center justify-center py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all border border-zinc-700"
          >
            Direct Source Ad
          </a>
          <button 
            onClick={onClose}
            className="flex items-center justify-center py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_5px_20px_rgba(16,185,129,0.2)]"
          >
            Acknowledge Intelligence
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
