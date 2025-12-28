
import React, { useState, useEffect } from 'react';
import { iPhoneListing } from '../types';
import { geminiService } from '../services/geminiService';
import { db } from '../services/databaseService';

interface ListingCardProps {
  listing: iPhoneListing;
  isActive?: boolean;
  agentEnabled?: boolean;
  viewMode?: 'grid' | 'compact';
  onSelect: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, isActive = false, agentEnabled = false, viewMode = 'grid', onSelect }) => {
  const [isGeneratingMsg, setIsGeneratingMsg] = useState(false);
  const [negMsg, setNegMsg] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    db.isInWatchlist(listing.id).then(setIsBookmarked);
  }, [listing.id]);

  const handleNegotiate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (negMsg) { setNegMsg(null); return; }
    setIsGeneratingMsg(true);
    geminiService.generateNegotiationMessage(listing).then(msg => {
      setNegMsg(msg);
      navigator.clipboard.writeText(msg);
    }).finally(() => setIsGeneratingMsg(false));
  };

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = await db.toggleWatchlist(listing);
    setIsBookmarked(saved);
  };

  const getRiskColor = (score: number) => {
    if (score < 20) return 'text-emerald-400';
    if (score < 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const RenderTechnicalBadges = () => (
    <div className="flex items-center gap-1.5">
      {listing.storageGb && (
        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[8px] font-black border border-zinc-700">
          {listing.storageGb}
        </span>
      )}
      {listing.batteryHealth && (
        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[8px] font-black border border-zinc-700">
          🔋 {listing.batteryHealth}
        </span>
      )}
      {agentEnabled && (
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border border-current opacity-70 ${getRiskColor(listing.riskScore)}`}>
          {listing.riskScore}% RISK
        </span>
      )}
    </div>
  );

  return (
    <div 
      onClick={onSelect}
      className={`group border rounded-lg p-3 transition-all flex items-center gap-4 relative overflow-hidden cursor-pointer ${
        isActive 
          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
          : 'bg-[#121214] hover:bg-[#1a1a1d] border-zinc-800'
      }`}
    >
      {isBookmarked && !isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
      )}
      {agentEnabled && listing.profitPotential > 100 && !isActive && !isBookmarked && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
      )}

      <div className={`w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0 border ${isActive ? 'border-emerald-500/50' : 'border-zinc-700'}`}>
        {!imageError && listing.imageUrl ? (
          <img src={listing.imageUrl} alt="" className="w-full h-full object-cover" onError={() => setImageError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-black text-sm ${isActive ? 'text-white' : 'text-emerald-500'}`}>{listing.price}</span>
          {listing.isVb && <span className="text-[8px] font-black text-amber-500/70 border border-amber-500/20 px-1 rounded uppercase">VB</span>}
          <h3 className={`font-bold text-xs truncate uppercase tracking-tight ${isActive ? 'text-white' : 'text-zinc-300'}`}>{listing.title}</h3>
        </div>
        <div className="flex items-center gap-3">
           <RenderTechnicalBadges />
           <span className="text-[10px] font-medium text-zinc-600 truncate max-w-[150px]">{listing.location}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={handleToggleWatchlist}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
            isBookmarked ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
          }`}
        >
          <svg className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
        </button>
        <button 
          onClick={handleNegotiate} 
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
            isActive ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}
        >
          {isGeneratingMsg ? <div className="w-3 h-3 border border-current border-t-transparent animate-spin" /> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
        </button>
      </div>

      {negMsg && (
        <div className="absolute inset-0 bg-emerald-600/95 backdrop-blur-sm p-4 flex items-center justify-between text-white animate-in slide-in-from-bottom duration-200 z-10">
          <span className="text-[10px] font-bold truncate pr-4 italic">"{negMsg}"</span>
          <button onClick={(e) => { e.stopPropagation(); setNegMsg(null); }} className="text-[9px] font-black bg-white/20 px-2 py-1 rounded">CLOSE</button>
        </div>
      )}
    </div>
  );
};

export default ListingCard;
