
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { iPhoneModel, MarketAnalysis, iPhoneListing } from './types';
import { geminiService } from './services/geminiService';
import { db } from './services/databaseService';
import ListingCard from './components/ListingCard';
import SearchStats from './components/SearchStats';
import PriceChart from './components/PriceChart';
import ListingDetail from './components/ListingDetail';

const MODELS: iPhoneModel[] = [
  'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16',
  'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15',
  'iPhone 14', 'iPhone 13'
];

type AppView = 'market' | 'watchlist' | 'archive';

function App() {
  const [selectedModel, setSelectedModel] = useState<iPhoneModel>(MODELS[0]);
  const [currentView, setCurrentView] = useState<AppView>('market');
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [vaultListings, setVaultListings] = useState<iPhoneListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('compact');
  const [agentEnabled, setAgentEnabled] = useState(true);
  const [selectedDetailListing, setSelectedDetailListing] = useState<iPhoneListing | null>(null);
  
  // Database Configuration State
  const [showDbSetup, setShowDbSetup] = useState(false);
  const [dbUrl, setDbUrl] = useState('');
  const [dbKey, setDbKey] = useState('');
  const [isCloudActive, setIsCloudActive] = useState(false);

  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkCloud = async () => {
      const config = await db.getCloudConfig();
      setDbUrl(config.url);
      setDbKey(config.key);
      setIsCloudActive(db.isCloudEnabled());
    };
    checkCloud();
  }, []);

  const handleSaveDbConfig = async () => {
    await db.setCloudConfig(dbUrl, dbKey);
    setIsCloudActive(true);
    setShowDbSetup(false);
  };

  const fetchListings = useCallback(async (model: iPhoneModel) => {
    setIsLoading(true);
    setCurrentView('market');
    try {
      const data = await geminiService.fetchRecentListings(model);
      setAnalysis(data);
      await db.saveScan(model, data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadVault = async (view: 'watchlist' | 'archive') => {
    setIsLoading(true);
    setCurrentView(view);
    setSelectedDetailListing(null);
    try {
      const data = view === 'watchlist' ? await db.getWatchlist() : await db.getArchive();
      setVaultListings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectListing = (listing: iPhoneListing) => {
    setSelectedDetailListing(listing);
    setTimeout(() => {
      const element = document.getElementById(listing.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  useEffect(() => { 
    if (currentView === 'market') {
      fetchListings(selectedModel); 
    }
  }, [selectedModel, fetchListings]);

  const activeListings = currentView === 'market' ? (analysis?.listings || []) : vaultListings;

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-zinc-300 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-800 bg-[#0f0f11] flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-black text-white tracking-tighter italic">
              iTRACK<span className="text-emerald-500">SNIPER</span>
            </h1>
            <button 
              onClick={() => setShowDbSetup(true)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${isCloudActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-700 hover:bg-zinc-500'}`}
              title={isCloudActive ? "Cloud Sync Active" : "Click to setup Cloud Database"}
            />
          </div>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            {isCloudActive ? 'External DB: SYNCED' : 'External DB: LOCAL ONLY'}
          </p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3 block px-2">Market Scanner</label>
            <div className="space-y-1">
              {MODELS.map(m => (
                <button
                  key={m}
                  onClick={() => { setSelectedModel(m); setCurrentView('market'); setSelectedDetailListing(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-between group ${
                    selectedModel === m && currentView === 'market' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-500 hover:bg-zinc-800/50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3 block px-2">Intelligence Vault</label>
            <div className="space-y-1">
              <button 
                onClick={() => loadVault('watchlist')}
                className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold flex items-center gap-2 ${currentView === 'watchlist' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-zinc-500 hover:bg-zinc-800/50'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                Watchlist
              </button>
              <button 
                onClick={() => loadVault('archive')}
                className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold flex items-center gap-2 ${currentView === 'archive' ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:bg-zinc-800/50'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                History Archive
              </button>
            </div>
          </section>
        </nav>

        <div className="p-4 bg-zinc-900/50 m-4 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Sniper Core</span>
            <button 
              onClick={() => setAgentEnabled(!agentEnabled)}
              className={`w-8 h-4 rounded-full relative transition-colors ${agentEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${agentEnabled ? 'left-4.5' : 'left-0.5'}`} />
            </button>
          </div>
          <p className="text-[9px] text-zinc-600 leading-tight">Hybrid DB active. Scans stored in local cache and synced to cloud if configured.</p>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden relative">
        <div 
          className={`flex flex-col border-r border-zinc-800 transition-all duration-500 ease-in-out bg-black ${
            selectedDetailListing ? 'w-[40%] min-w-[450px]' : 'w-full'
          }`}
        >
          <div className="h-10 bg-zinc-900/80 border-b border-zinc-800 flex items-center overflow-hidden px-4 gap-8 whitespace-nowrap shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-zinc-400">Arb Data Stream</span>
            </div>
            <div className="flex gap-8 animate-marquee">
              {activeListings.slice(0, 10).map(l => (
                <span key={l.id} className="text-[10px] font-bold text-zinc-500">
                  <span className="text-emerald-400">{l.price}</span> {l.title.slice(0, 15)}...
                </span>
              ))}
            </div>
          </div>

          <header className="p-6 bg-gradient-to-b from-[#121214] to-black border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
            <div className="min-w-0">
              <h2 className={`font-black text-white tracking-tight transition-all truncate uppercase ${selectedDetailListing ? 'text-lg' : 'text-2xl'}`}>
                {currentView === 'market' ? `${selectedModel} INTEL` : currentView === 'watchlist' ? 'WATCHLIST' : 'HISTORY ARCHIVE'}
                {isLoading && <span className="ml-3 inline-block w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin align-middle" />}
              </h2>
            </div>

            {!selectedDetailListing && currentView === 'market' && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => fetchListings(selectedModel)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                >
                  SCAN
                </button>
              </div>
            )}
          </header>

          <div ref={listContainerRef} className="flex-1 overflow-y-auto p-6 scrollbar-terminal">
            {!selectedDetailListing && currentView === 'market' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                <div className="lg:col-span-8"><SearchStats analysis={analysis} isLoading={isLoading} agentEnabled={agentEnabled} /></div>
                <div className="lg:col-span-4">
                  <PriceChart 
                    listings={analysis?.listings || []} 
                    avgPrice={analysis?.averagePrice || 0} 
                    onPointClick={handleSelectListing}
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  {currentView === 'market' ? 'Live Opportunities' : `${activeListings.length} Indexed Records`}
                </span>
              </div>
              
              <div className={viewMode === 'grid' && !selectedDetailListing
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" 
                : "flex flex-col gap-2"
              }>
                {activeListings.map(listing => (
                  <div id={listing.id} key={listing.id}>
                    <ListingCard 
                      listing={listing} 
                      isActive={selectedDetailListing?.id === listing.id}
                      agentEnabled={agentEnabled} 
                      viewMode={selectedDetailListing ? 'compact' : viewMode}
                      onSelect={() => handleSelectListing(listing)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`h-full transition-all duration-500 ease-in-out bg-[#0f0f11] overflow-hidden ${
            selectedDetailListing ? 'flex-1 opacity-100' : 'w-0 opacity-0 pointer-events-none'
          }`}
        >
          {selectedDetailListing && (
            <ListingDetail 
              listing={selectedDetailListing} 
              marketAvg={analysis?.averagePrice || 0}
              retailBench={analysis?.backMarketPrice || 0}
              onClose={() => setSelectedDetailListing(null)}
            />
          )}
        </div>
      </main>

      {/* Database Setup Modal */}
      {showDbSetup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-black text-white mb-2">Connect Cloud Database</h2>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Link your own <span className="text-emerald-500">Supabase</span> project to persist your market intel across devices. Data is currently being stored in your local browser cache.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Supabase URL</label>
                <input 
                  type="text" 
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  placeholder="https://your-id.supabase.co"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 transition-all text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Anon Public Key</label>
                <input 
                  type="password" 
                  value={dbKey}
                  onChange={(e) => setDbKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 transition-all text-white outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setShowDbSetup(false)}
                className="flex-1 py-3 text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
              >
                Skip
              </button>
              <button 
                onClick={handleSaveDbConfig}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_5px_15px_rgba(16,185,129,0.2)]"
              >
                Connect Intel
              </button>
            </div>
            
            <p className="mt-6 text-[9px] text-zinc-600 text-center leading-tight uppercase font-bold tracking-widest">
              Security Notice: Keys are stored in your local browser cache.
            </p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: flex; animation: marquee 30s linear infinite; }
        .scrollbar-terminal::-webkit-scrollbar { width: 6px; }
        .scrollbar-terminal::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-terminal::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}} />
    </div>
  );
}

export default App;
