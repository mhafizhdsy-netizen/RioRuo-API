
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ApiEndpoint } from './src/types/types.ts';
import { apiService, BASE_URL } from './frontend-api/api';
import { ConsoleOutput } from './components/ConsoleOutput';
import { Documentation } from './components/Documentation';
import { 
  Terminal, Search, Zap, 
  Settings, Command, Layout, 
  List, Grid, Film, ChevronDown, Check,
  Github, Heart, Code, Globe, CalendarDays,
  BookOpen, SlidersHorizontal
} from 'lucide-react';

export function App() {
  const [view, setView] = useState<'playground' | 'docs'>('playground');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>(ApiEndpoint.HOME);
  
  // Request Params
  const [keyword, setKeyword] = useState('jujutsu kaisen');
  const [animeSlug, setAnimeSlug] = useState('jujutsu-kaisen-s2');
  const [episodeSlug, setEpisodeSlug] = useState('jujutsu-kaisen-s2-episode-23');
  const [batchSlug, setBatchSlug] = useState('jujutsu-kaisen-s2-batch');
  const [genreSlug, setGenreSlug] = useState('action');
  const [episodeNumber, setEpisodeNumber] = useState('1');
  const [page, setPage] = useState('1');
  // New states for movie endpoint
  const [movieYear, setMovieYear] = useState('2024');
  const [movieMonth, setMovieMonth] = useState('01'); // Actual month for the movie path segment
  const [movieTitleSlug, setMovieTitleSlug] = useState('dandadan'); // Movie title slug part

  // Response State
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [requestMeta, setRequestMeta] = useState({
    status: 0,
    latency: 0,
    timestamp: '-'
  });

  // Real-time API Status State
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect for handling clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Function to check API status
  const checkApiStatus = async () => {
    try {
      setApiStatus('checking');
      const response = await fetch(`${BASE_URL}/otakudesu/v1`); // Call the backend's root API endpoint
      if (response.ok) {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      console.error("Failed to fetch API status:", error);
      setApiStatus('offline');
    }
  };

  // Effect for periodic API status check
  useEffect(() => {
    checkApiStatus(); // Initial check
    const interval = setInterval(checkApiStatus, 3600000); // Check every 1 hour
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleFetch = useCallback(async () => {
    setLoading(true);
    setResponseData(null);
    setIsDropdownOpen(false);
    
    const startTime = performance.now();
    const timestamp = new Date().toLocaleTimeString();

    try {
      let res;
      // Simple router logic based on the selected endpoint string
      if (selectedEndpoint === ApiEndpoint.HOME) res = await apiService.getHome();
      else if (selectedEndpoint === ApiEndpoint.SEARCH) res = await apiService.getSearch(keyword);
      else if (selectedEndpoint === ApiEndpoint.ONGOING) res = await apiService.getOngoing(parseInt(page));
      else if (selectedEndpoint === ApiEndpoint.COMPLETED) res = await apiService.getCompleted(parseInt(page));
      else if (selectedEndpoint === ApiEndpoint.ANIME_DETAIL) res = await apiService.getAnimeDetail(animeSlug);
      else if (selectedEndpoint === ApiEndpoint.ANIME_EPISODES) res = await apiService.getAnimeEpisodes(animeSlug);
      else if (selectedEndpoint === ApiEndpoint.EPISODE_BY_NUMBER) res = await apiService.getEpisodeByNumber(animeSlug, parseInt(episodeNumber));
      else if (selectedEndpoint === ApiEndpoint.EPISODE_DETAIL) res = await apiService.getEpisodeDetail(episodeSlug);
      else if (selectedEndpoint === ApiEndpoint.GENRES) res = await apiService.getGenres();
      else if (selectedEndpoint === ApiEndpoint.GENRE_DETAIL) res = await apiService.getGenreDetail(genreSlug, parseInt(page));
      else if (selectedEndpoint === ApiEndpoint.BATCH_DETAIL) res = await apiService.getBatchDetail(batchSlug);
      else if (selectedEndpoint === ApiEndpoint.BATCH_BY_ANIME_SLUG) res = await apiService.getBatchByAnimeSlug(animeSlug);
      else if (selectedEndpoint === ApiEndpoint.MOVIES) res = await apiService.getMovies(parseInt(page)); // New API call
      else if (selectedEndpoint === ApiEndpoint.SINGLE_MOVIE) res = await apiService.getSingleMovie(movieYear, movieMonth, movieTitleSlug); // Updated API call
      else if (selectedEndpoint === ApiEndpoint.JADWAL_RILIS) res = await apiService.getJadwalRilis(); // New API call
      else res = await apiService.getHome(); // Fallback

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      // Check if the response itself indicates an error from our backend wrapper
      const status = (res as any).status === 'error' ? 500 : 200;

      setResponseData(res);
      setRequestMeta({ status, latency, timestamp });

    } catch (err: any) {
      const endTime = performance.now();
      const errorStatus = err.message.includes('404') ? 404 : 503; // Attempt to infer status from message
      setResponseData({ 
        status: "error", 
        message: err.message || "Network Failed or Backend Unreachable",
        hint: "Make sure the backend server is running and accessible, and the endpoint path is correct." 
      });
      setRequestMeta({ 
        status: errorStatus, 
        latency: Math.round(endTime - startTime), 
        timestamp 
      });
    } finally {
      setLoading(false);
    }
  }, [selectedEndpoint, keyword, page, animeSlug, episodeNumber, episodeSlug, genreSlug, batchSlug, movieYear, movieMonth, movieTitleSlug]);

  // Helper to render dynamic inputs based on selected endpoint
  const renderInputs = useCallback(() => {
    const inputs = [];
    
    if (selectedEndpoint === ApiEndpoint.SEARCH) {
      inputs.push(
        <div key="keyword" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Search Keyword</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              value={keyword} onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-white"
              placeholder="e.g. Naruto"
            />
          </div>
        </div>
      );
    }
    
    // Anime Slug for ANIME_DETAIL, ANIME_EPISODES, BATCH_BY_ANIME_SLUG, EPISODE_BY_NUMBER
    if ([
      ApiEndpoint.ANIME_DETAIL, 
      ApiEndpoint.ANIME_EPISODES, 
      ApiEndpoint.BATCH_BY_ANIME_SLUG,
      ApiEndpoint.EPISODE_BY_NUMBER
    ].includes(selectedEndpoint as ApiEndpoint)) {
      inputs.push(
        <div key="animeSlug" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Anime Slug</label>
          <input 
            type="text" 
            value={animeSlug} onChange={(e) => setAnimeSlug(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono"
            placeholder="e.g. one-piece"
          />
        </div>
      );
    }

    // Episode Number for EPISODE_BY_NUMBER
    if (selectedEndpoint === ApiEndpoint.EPISODE_BY_NUMBER) {
      inputs.push(
        <div key="episodeNumber" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Episode Number</label>
          <input 
            type="number" 
            value={episodeNumber} onChange={(e) => setEpisodeNumber(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono"
            placeholder="e.g. 1"
          />
        </div>
      );
    }

    // Episode Slug for EPISODE_DETAIL
    if (selectedEndpoint === ApiEndpoint.EPISODE_DETAIL) {
      inputs.push(
        <div key="episodeSlug" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Episode Slug</label>
          <input 
            type="text" 
            value={episodeSlug} onChange={(e) => setEpisodeSlug(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono"
            placeholder="e.g. one-piece-episode-1"
          />
        </div>
      );
    }

    // Batch Slug for BATCH_DETAIL
    if (selectedEndpoint === ApiEndpoint.BATCH_DETAIL) {
      inputs.push(
        <div key="batchSlug" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Batch Slug</label>
          <input 
            type="text" 
            value={batchSlug} onChange={(e) => setBatchSlug(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono"
            placeholder="e.g. jujutsu-kaisen-s2-batch"
          />
        </div>
      );
    }

    // Genre Slug for GENRE_DETAIL
    if (selectedEndpoint === ApiEndpoint.GENRE_DETAIL) {
      inputs.push(
        <div key="genreSlug" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Genre Slug</label>
          <input 
            type="text" 
            value={genreSlug} onChange={(e) => setGenreSlug(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono"
            placeholder="e.g. action"
          />
        </div>
      );
    }

    // Movie Year, Month, and Slug for SINGLE_MOVIE (no longer in categories, but logic remains)
    if (selectedEndpoint === ApiEndpoint.SINGLE_MOVIE) {
      inputs.push(
        <div key="movieYear" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Movie Year</label>
          <input 
            type="text" 
            value={movieYear} onChange={(e) => setMovieYear(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono"
            placeholder="e.g. 2024"
          />
        </div>
      );
      inputs.push(
        <div key="movieMonth" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Movie Month (Path Segment)</label>
          <input 
            type="text" 
            value={movieMonth} onChange={(e) => setMovieMonth(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono"
            placeholder="e.g. 01"
          />
        </div>
      );
      inputs.push(
        <div key="movieTitleSlug" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Movie Title Slug</label>
          <input 
            type="text" 
            value={movieTitleSlug} onChange={(e) => setMovieTitleSlug(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono"
            placeholder="e.g. dandadan"
          />
        </div>
      );
    }


    // Generic Page Input for lists - only for ongoing, completed, genre detail, and movies
    if ([
      ApiEndpoint.ONGOING, ApiEndpoint.COMPLETED, 
      ApiEndpoint.GENRE_DETAIL, ApiEndpoint.MOVIES
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
  }, [
      selectedEndpoint, keyword, setKeyword, animeSlug, setAnimeSlug, 
      episodeSlug, setEpisodeSlug, batchSlug, setBatchSlug, genreSlug, setGenreSlug, 
      episodeNumber, setEpisodeNumber, page, setPage, movieYear, setMovieYear, 
      movieMonth, setMovieMonth, movieTitleSlug, setMovieTitleSlug
  ]);

  const categories = [
    { name: "Discovery", icon: <Layout size={16} />, items: [ApiEndpoint.HOME] },
    { name: "Lists", icon: <List size={16} />, items: [ApiEndpoint.ONGOING, ApiEndpoint.COMPLETED] },
    { name: "Search", icon: <Search size={16} />, items: [ApiEndpoint.SEARCH] },
    { name: "Details", icon: <Film size={16} />, items: [
      ApiEndpoint.ANIME_DETAIL, 
      ApiEndpoint.ANIME_EPISODES,
      ApiEndpoint.EPISODE_BY_NUMBER,
      ApiEndpoint.EPISODE_DETAIL, 
      ApiEndpoint.BATCH_DETAIL,
      ApiEndpoint.BATCH_BY_ANIME_SLUG
    ]},
    { name: "Metadata", icon: <Grid size={16} />, items: [ApiEndpoint.GENRES, ApiEndpoint.GENRE_DETAIL] },
    // Removed "Movies" category as requested
    { name: "Schedule", icon: <CalendarDays size={16} />, items: [ApiEndpoint.JADWAL_RILIS]}, // New Category
  ];

  // Logic to display meaningful base url
  const displayBaseUrl = `${BASE_URL}/otakudesu/v1`;
  
  const Playground = useCallback(() => (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-6 flex-1">
      {/* Request Controller */}
      <div className="bg-surface border border-border rounded-xl p-5 shadow-lg relative z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Command size={20} className="text-primary" />
            <h2 className="text-xl font-bold text-white">Request Controller</h2>
          </div>
          <a
            href="https://rioruo.vercel.app/otakudesu/v1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-mono bg-surfaceLight border border-border px-3 py-1.5 rounded-full hover:border-zinc-600 transition-colors"
          >
            <div className={`w-2 h-2 rounded-full 
              ${apiStatus === 'online' ? 'bg-primary' : apiStatus === 'offline' ? 'bg-error' : 'bg-warning'} 
              ${(apiStatus === 'checking' || apiStatus === 'offline') ? 'animate-pulse' : ''}`
            }></div>
            <span className="text-zinc-400">
              {apiStatus === 'online' ? 'API Status' : apiStatus === 'offline' ? 'API Offline' : 'Checking API...'}
            </span>
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          <div className="md:col-span-4 flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Base URL</label>
            <div className="bg-surfaceLight border border-border rounded-lg py-3 px-4 text-sm font-mono text-zinc-400 select-all truncate flex items-center h-[46px]">
              {displayBaseUrl}
            </div>
          </div>
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
                            onClick={() => { setSelectedEndpoint(endpoint); setIsDropdownOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between group ${selectedEndpoint === endpoint ? 'bg-primary/10 text-primary border border-primary/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
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
        {renderInputs()}
        <div className="flex justify-end pt-4 border-t border-white/5">
          <button
            onClick={handleFetch}
            disabled={loading}
            className="bg-primary hover:bg-emerald-400 text-black font-bold py-2.5 px-8 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
          >
            {loading ? <Settings className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
            <span>SEND REQUEST</span>
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-[500px]">
        <ConsoleOutput data={responseData} loading={loading} meta={requestMeta} />
      </div>
    </div>
  ), [
    apiStatus, displayBaseUrl, dropdownRef, isDropdownOpen, selectedEndpoint, 
    categories, renderInputs, handleFetch, loading, responseData, requestMeta
  ]);

  return (
    <div className="min-h-screen bg-background text-zinc-300 font-sans selection:bg-primary/20 selection:text-primary flex flex-col min-h-screen">
      <header className="h-14 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <Terminal size={18} strokeWidth={3} />
          </div>
          <h1 className="font-bold text-white tracking-tight text-lg">RioRuo API</h1>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setView(view === 'playground' ? 'docs' : 'playground')}
             className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors bg-surfaceLight border border-border px-3 py-1.5 rounded-full"
           >
             {view === 'playground' ? <><BookOpen size={14} /> Docs</> : <><SlidersHorizontal size={14}/> Playground</>}
           </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto">
        {view === 'playground' ? <Playground /> : <Documentation />}
        
        <footer className="w-full max-w-6xl mx-auto mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2 text-zinc-300">
                <Terminal size={16} className="text-primary" />
                <span className="font-bold tracking-tight">RioRuo API</span>
              </div>
              <p className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                &copy; {new Date().getFullYear()} Developed with <Heart size={10} className="text-error fill-error animate-pulse" /> by <span className="text-primary font-bold">Rio</span>
              </p>
            </div>
            <nav className="flex items-center gap-6">
              <a href="https://github.com/rioxr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors group">
                <Github size={14} className="group-hover:text-white" />
                <span>GitHub</span>
              </a>
              <button onClick={() => setView('docs')} className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors group">
                <Code size={14} className="group-hover:text-primary" />
                <span>Documentation</span>
              </button>
              <a href="https://status.rioruo.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors group">
                <Globe size={14} className="group-hover:text-info" />
                <span>Status</span>
              </a>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}
