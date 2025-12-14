import React, { useState, useRef, useEffect } from 'react';
import { ApiEndpoint } from './types';
import { apiService, BASE_URL } from './services/api';
import { ConsoleOutput } from './components/ConsoleOutput';
import { 
  Terminal, Search, Zap, 
  Settings, Command, Layout, 
  List, Grid, Film, ChevronDown, Check,
  Server
} from 'lucide-react';

function App() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>(ApiEndpoint.HOME);
  
  // Request Params
  const [query, setQuery] = useState('one piece');
  const [animeId, setAnimeId] = useState('one-piece');
  const [episodeId, setEpisodeId] = useState('one-piece-episode-1141');
  const [batchId, setBatchId] = useState('mushoku-no-eiyuu');
  const [genreId, setGenreId] = useState('action');
  const [serverId, setServerId] = useState('9AAB5-6-xhmyrq');
  const [page, setPage] = useState('1');
  
  // Response State
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [requestMeta, setRequestMeta] = useState({
    status: 0,
    latency: 0,
    timestamp: '-'
  });

  // Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFetch = async () => {
    setLoading(true);
    setResponseData(null);
    setIsDropdownOpen(false);
    
    const startTime = performance.now();
    const timestamp = new Date().toLocaleTimeString();

    try {
      let res;
      // Simple router logic based on the selected endpoint string
      if (selectedEndpoint === ApiEndpoint.HOME) res = await apiService.getHome();
      else if (selectedEndpoint === ApiEndpoint.RECENT) res = await apiService.getRecent(parseInt(page));
      else if (selectedEndpoint === ApiEndpoint.SEARCH) res = await apiService.getSearch(query, parseInt(page));
      else if (selectedEndpoint === ApiEndpoint.ONGOING) res = await apiService.getOngoing(parseInt(page));
      else if (selectedEndpoint === ApiEndpoint.COMPLETED) res = await apiService.getCompleted(parseInt(page));
      else if (selectedEndpoint === ApiEndpoint.POPULAR) res = await apiService.getPopular(parseInt(page));
      else if (selectedEndpoint === ApiEndpoint.MOVIES) res = await apiService.getMovies(parseInt(page));
      else if (selectedEndpoint === ApiEndpoint.SCHEDULE) res = await apiService.getSchedule();
      else if (selectedEndpoint.includes('/anime/')) res = await apiService.getAnimeDetail(animeId);
      else if (selectedEndpoint.includes('/episode/')) res = await apiService.getEpisodeDetail(episodeId);
      else if (selectedEndpoint === ApiEndpoint.GENRES) res = await apiService.getGenres();
      else if (selectedEndpoint.includes('/genres/')) res = await apiService.getGenreDetail(genreId, parseInt(page));
      else if (selectedEndpoint === ApiEndpoint.BATCH_LIST) res = await apiService.getBatchList(parseInt(page));
      else if (selectedEndpoint.includes('/batch/')) res = await apiService.getBatchDetail(batchId);
      else if (selectedEndpoint.includes('/server/')) res = await apiService.getServer(serverId);
      else res = await apiService.getHome(); // Fallback

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      // Check if the response itself indicates an error from our backend wrapper
      const status = (res as any).status === 'error' ? 500 : 200;

      setResponseData(res);
      setRequestMeta({ status, latency, timestamp });

    } catch (err: any) {
      const endTime = performance.now();
      setResponseData({ 
        status: "error", 
        message: err.message || "Network Failed",
        hint: "Make sure the backend server is running (npm run start:server) and accessible." 
      });
      setRequestMeta({ 
        status: 503, // Service Unavailable
        latency: Math.round(endTime - startTime), 
        timestamp 
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to render dynamic inputs based on selected endpoint
  const renderInputs = () => {
    const inputs = [];
    
    if (selectedEndpoint === ApiEndpoint.SEARCH) {
      inputs.push(
        <div key="q" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Search Query</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              value={query} onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-white"
              placeholder="e.g. Naruto"
            />
          </div>
        </div>
      );
    }
    
    if (selectedEndpoint.includes(':animeId')) {
      inputs.push(
        <div key="aid" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Anime Slug ID</label>
          <input 
            type="text" 
            value={animeId} onChange={(e) => setAnimeId(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono"
            placeholder="e.g. one-piece"
          />
        </div>
      );
    }

    if (selectedEndpoint.includes(':episodeId')) {
      inputs.push(
        <div key="eid" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Episode Slug ID</label>
          <input 
            type="text" 
            value={episodeId} onChange={(e) => setEpisodeId(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono"
            placeholder="e.g. one-piece-episode-1"
          />
        </div>
      );
    }

    if (selectedEndpoint.includes(':batchId')) {
      inputs.push(
        <div key="bid" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Batch Slug ID</label>
          <input 
            type="text" 
            value={batchId} onChange={(e) => setBatchId(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono"
            placeholder="e.g. mushoku-no-eiyuu"
          />
        </div>
      );
    }

    if (selectedEndpoint.includes(':genreId')) {
      inputs.push(
        <div key="gid" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Genre ID</label>
          <input 
            type="text" 
            value={genreId} onChange={(e) => setGenreId(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono"
            placeholder="e.g. action"
          />
        </div>
      );
    }

    if (selectedEndpoint.includes(':serverId')) {
      inputs.push(
        <div key="sid" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Server ID</label>
          <input 
            type="text" 
            value={serverId} onChange={(e) => setServerId(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono"
            placeholder="e.g. 9AAB5-6-xhmyrq"
          />
        </div>
      );
    }

    // Generic Page Input for lists
    if ([
      ApiEndpoint.SEARCH, ApiEndpoint.RECENT, ApiEndpoint.ONGOING, 
      ApiEndpoint.COMPLETED, ApiEndpoint.POPULAR, ApiEndpoint.MOVIES, 
      ApiEndpoint.GENRE_DETAIL, ApiEndpoint.BATCH_LIST
    ].includes(selectedEndpoint as ApiEndpoint)) {
      inputs.push(
        <div key="pg" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Page</label>
          <input 
            type="number" 
            value={page} onChange={(e) => setPage(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white"
            placeholder="1"
          />
        </div>
      );
    }

    return inputs.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
        {inputs}
      </div>
    ) : null;
  };

  const categories = [
    { name: "Discovery", icon: <Layout size={16} />, items: [ApiEndpoint.HOME, ApiEndpoint.RECENT, ApiEndpoint.POPULAR] },
    { name: "Lists", icon: <List size={16} />, items: [ApiEndpoint.ONGOING, ApiEndpoint.COMPLETED, ApiEndpoint.MOVIES, ApiEndpoint.BATCH_LIST] },
    { name: "Search & Schedule", icon: <Search size={16} />, items: [ApiEndpoint.SEARCH, ApiEndpoint.SCHEDULE] },
    { name: "Details", icon: <Film size={16} />, items: [ApiEndpoint.ANIME_DETAIL, ApiEndpoint.EPISODE_DETAIL, ApiEndpoint.BATCH_DETAIL] },
    { name: "Metadata", icon: <Grid size={16} />, items: [ApiEndpoint.GENRES, ApiEndpoint.GENRE_DETAIL] },
    { name: "System", icon: <Server size={16} />, items: [ApiEndpoint.SERVER] },
  ];

  // Logic to display meaningful base url
  const displayBaseUrl = BASE_URL || typeof window !== 'undefined' ? window.location.origin : 'Relative';

  return (
    <div className="min-h-screen bg-background text-zinc-300 font-sans selection:bg-primary/20 selection:text-primary flex flex-col h-screen">
      
      {/* Top Bar / Header */}
      <header className="h-14 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <Terminal size={18} strokeWidth={3} />
          </div>
          <h1 className="font-bold text-white tracking-tight text-lg">Samehadaku API Console</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono bg-surfaceLight border border-border px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-zinc-400">System Operational</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
          
          {/* Request Controller */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-lg relative z-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Command size={20} className="text-primary" />
                <h2 className="text-xl font-bold text-white">Request Controller</h2>
              </div>
              <span className="bg-surfaceLight border border-border px-3 py-1 rounded text-xs font-mono text-zinc-400 whitespace-nowrap hidden md:block">
                JSON Response Only
              </span>
            </div>

            {/* Split Base URL and Custom Dropdown Selector */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
              
              {/* Base URL Field */}
              <div className="md:col-span-4 flex flex-col gap-2">
                 <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Base URL</label>
                 <div className="bg-surfaceLight border border-border rounded-lg py-3 px-4 text-sm font-mono text-zinc-400 select-all truncate flex items-center h-[46px]">
                   {displayBaseUrl}
                 </div>
              </div>

              {/* Endpoint Selector - Custom Dropdown */}
              <div className="md:col-span-8 flex flex-col gap-2 relative">
                 <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Target Endpoint</label>
                 
                 <div ref={dropdownRef} className="relative">
                   <button 
                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                     className="w-full bg-surfaceLight border border-border rounded-lg py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left flex items-center justify-between h-[46px] group hover:border-zinc-600"
                   >
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <span className="font-bold text-primary text-xs">GET</span>
                     </div>
                     <span className="font-mono truncate">{selectedEndpoint}</span>
                     <ChevronDown size={16} className={`text-zinc-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                   </button>

                   {/* Dropdown Menu */}
                   {isDropdownOpen && (
                     <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[400px] overflow-y-auto custom-scrollbar ring-1 ring-black/5">
                        {categories.map((cat, idx) => (
                          <div key={idx} className="border-b border-white/5 last:border-0 pb-1">
                            <div className="flex items-center gap-2 px-4 py-2 bg-black/20 text-[10px] font-bold text-zinc-500 uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
                              {cat.icon} {cat.name}
                            </div>
                            <div className="p-1">
                              {cat.items.map((endpoint) => (
                                <button
                                  key={endpoint}
                                  onClick={() => {
                                    setSelectedEndpoint(endpoint);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between group ${
                                    selectedEndpoint === endpoint 
                                      ? 'bg-primary/10 text-primary border border-primary/20' 
                                      : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                                  }`}
                                >
                                  <span className="truncate">{endpoint}</span>
                                  {selectedEndpoint === endpoint && <Check size={14} className="text-primary" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                     </div>
                   )}
                 </div>
              </div>
            </div>

            {/* Dynamic Inputs */}
            {renderInputs()}

            {/* Action Bar */}
            <div className="flex justify-end pt-4 border-t border-white/5">
              <button 
                onClick={handleFetch}
                disabled={loading}
                className="
                  bg-primary hover:bg-emerald-400 text-black font-bold py-2.5 px-8 rounded-lg 
                  flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] 
                  hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                  w-full md:w-auto justify-center
                "
              >
                {loading ? <Settings className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                <span>SEND REQUEST</span>
              </button>
            </div>
          </div>

          {/* Output Console */}
          <div className="flex-1 min-h-[500px]">
            <ConsoleOutput data={responseData} loading={loading} meta={requestMeta} />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;