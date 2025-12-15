
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
  const [animeSlug, setAnimeSlug] = useState('1piece-sub-indo');
  const [episodeSlug, setEpisodeSlug] = useState('wpoiec-episode-1152-sub-indo');
  const [batchSlug, setBatchSlug] = useState('wpoiec-batch-sub-indo');
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
      const response = await fetch(`${BASE_URL}/v1/`); // Call the backend's root API endpoint (Updated with trailing slash)
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
    const inputClass = "w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300 text-white font-mono placeholder:text-zinc-600";
    const labelClass = "text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2 block";
    const containerClass = "flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500";

    if (selectedEndpoint === ApiEndpoint.SEARCH) {
      inputs.push(
        <div key="keyword" className={containerClass}>
          <label className={labelClass}>Search Keyword</label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors duration-300" size={16} />
            <input 
              type="text" 
              value={keyword} onChange={(e) => setKeyword(e.target.value)}
              className={`${inputClass} pl-10`}
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
        <div key="animeSlug" className={containerClass}>
          <label className={labelClass}>Anime Slug</label>
          <input 
            type="text" 
            value={animeSlug} onChange={(e) => setAnimeSlug(e.target.value)}
            className={inputClass}
            placeholder="e.g. one-piece"
          />
        </div>
      );
    }

    // Episode Number for EPISODE_BY_NUMBER
    if (selectedEndpoint === ApiEndpoint.EPISODE_BY_NUMBER) {
      inputs.push(
        <div key="episodeNumber" className={containerClass}>
          <label className={labelClass}>Episode Number</label>
          <input 
            type="number" 
            value={episodeNumber} onChange={(e) => setEpisodeNumber(e.target.value)}
            className={inputClass}
            placeholder="e.g. 1"
          />
        </div>
      );
    }

    // Episode Slug for EPISODE_DETAIL
    if (selectedEndpoint === ApiEndpoint.EPISODE_DETAIL) {
      inputs.push(
        <div key="episodeSlug" className={containerClass}>
          <label className={labelClass}>Episode Slug</label>
          <input 
            type="text" 
            value={episodeSlug} onChange={(e) => setEpisodeSlug(e.target.value)}
            className={inputClass}
            placeholder="e.g. one-piece-episode-1"
          />
        </div>
      );
    }

    // Batch Slug for BATCH_DETAIL
    if (selectedEndpoint === ApiEndpoint.BATCH_DETAIL) {
      inputs.push(
        <div key="batchSlug" className={containerClass}>
          <label className={labelClass}>Batch Slug</label>
          <input 
            type="text" 
            value={batchSlug} onChange={(e) => setBatchSlug(e.target.value)}
            className={inputClass}
            placeholder="e.g. jujutsu-kaisen-s2-batch"
          />
        </div>
      );
    }

    // Genre Slug for GENRE_DETAIL
    if (selectedEndpoint === ApiEndpoint.GENRE_DETAIL) {
      inputs.push(
        <div key="genreSlug" className={containerClass}>
          <label className={labelClass}>Genre Slug</label>
          <input 
            type="text" 
            value={genreSlug} onChange={(e) => setGenreSlug(e.target.value)}
            className={inputClass}
            placeholder="e.g. action"
          />
        </div>
      );
    }

    // Movie Year, Month, and Slug for SINGLE_MOVIE (no longer in categories, but logic remains)
    if (selectedEndpoint === ApiEndpoint.SINGLE_MOVIE) {
      inputs.push(
        <div key="movieYear" className={containerClass}>
          <label className={labelClass}>Movie Year</label>
          <input 
            type="text" 
            value={movieYear} onChange={(e) => setMovieYear(e.target.value)}
            className={inputClass}
            placeholder="e.g. 2024"
          />
        </div>
      );
      inputs.push(
        <div key="movieMonth" className={containerClass}>
          <label className={labelClass}>Movie Month (Path Segment)</label>
          <input 
            type="text" 
            value={movieMonth} onChange={(e) => setMovieMonth(e.target.value)}
            className={inputClass}
            placeholder="e.g. 01"
          />
        </div>
      );
      inputs.push(
        <div key="movieTitleSlug" className={containerClass}>
          <label className={labelClass}>Movie Title Slug</label>
          <input 
            type="text" 
            value={movieTitleSlug} onChange={(e) => setMovieTitleSlug(e.target.value)}
            className={inputClass}
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
        <div key="pg" className={containerClass}>
          <label className={labelClass}>Page</label>
          <input 
            type="number" 
            value={page} onChange={(e) => setPage(e.target.value)}
            className={inputClass}
            placeholder="1"
          />
        </div>
      );
    }

    return inputs.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
  const displayBaseUrl = 'https://rioruo.vercel.app';
  
  const Playground = useCallback(() => (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-6 flex-1 animate-in fade-in duration-500">
      {/* Request Controller */}
      <div className="bg-surface border border-border rounded-xl p-5 shadow-lg relative z-20 transition-all duration-300 hover:shadow-primaryDim/5 hover:border-zinc-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Command size={20} className="text-primary" />
            <h2 className="text-xl font-bold text-white tracking-tight">Request Controller</h2>
          </div>
          <a
            href="https://rioruo.vercel.app/v1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-mono bg-surfaceLight border border-border px-3 py-1.5 rounded-full hover:border-zinc-500 transition-all duration-300 hover:scale-105"
          >
            <div className={`w-2 h-2 rounded-full 
              ${apiStatus === 'online' ? 'bg-primary shadow-[0_0_8px_rgba(16,185,129,0.6)]' : apiStatus === 'offline' ? 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-warning'} 
              ${(apiStatus === 'checking' || apiStatus === 'offline') ? 'animate-pulse' : ''}`
            }></div>
            <span className="text-zinc-400 font-medium">
              {apiStatus === 'online' ? 'API Status: Online' : apiStatus === 'offline' ? 'API Offline' : 'Checking...'}
            </span>
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          <div className="md:col-span-4 flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Base URL</label>
            <div className="bg-surfaceLight border border-border rounded-lg py-3 px-4 text-sm font-mono text-zinc-400 select-all truncate flex items-center h-[46px] transition-colors hover:bg-white/5 hover:text-zinc-300 cursor-text">
              {displayBaseUrl}
            </div>
          </div>
          <div className="md:col-span-8 flex flex-col gap-2 relative">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Target Endpoint</label>
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-surfaceLight border border-border rounded-lg py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 text-left flex items-center justify-between h-[46px] group hover:border-zinc-600 hover:bg-surfaceLight/80 active:scale-[0.99]"
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="font-bold text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">GET</span>
                </div>
                <span className="font-mono truncate ml-1">{selectedEndpoint}</span>
                <ChevronDown size={16} className={`text-zinc-500 transition-transform duration-300 ease-in-out ${isDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 max-h-[400px] overflow-y-auto custom-scrollbar ring-1 ring-black/5 origin-top">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="border-b border-white/5 last:border-0 pb-1">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-surfaceLight/95 backdrop-blur-sm text-[10px] font-bold text-zinc-400 uppercase tracking-wider sticky top-0 z-10 border-b border-white/5">
                        <span className="text-primary">{cat.icon}</span> {cat.name}
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        {cat.items.map((endpoint) => (
                          <button
                            key={endpoint}
                            onClick={() => { setSelectedEndpoint(endpoint); setIsDropdownOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all duration-200 flex items-center justify-between group relative overflow-hidden ${selectedEndpoint === endpoint ? 'bg-primary/10 text-primary border border-primary/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                          >
                            <span className="truncate relative z-10">{endpoint}</span>
                            {selectedEndpoint === endpoint && <Check size={14} className="text-primary animate-in fade-in zoom-in duration-300" />}
                            {selectedEndpoint !== endpoint && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
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
            className="bg-primary hover:bg-emerald-400 text-black font-bold py-2.5 px-8 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:translate-y-[-1px] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none w-full md:w-auto justify-center group"
          >
            {loading ? <Settings className="animate-spin" size={18} /> : <Zap size={18} className="fill-current group-hover:scale-110 transition-transform duration-300" />}
            <span>SEND REQUEST</span>
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <ConsoleOutput data={responseData} loading={loading} meta={requestMeta} />
      </div>
    </div>
  ), [
    apiStatus, displayBaseUrl, dropdownRef, isDropdownOpen, selectedEndpoint, 
    categories, renderInputs, handleFetch, loading, responseData, requestMeta
  ]);

  return (
    <div className="min-h-screen bg-background text-zinc-300 font-sans selection:bg-primary/20 selection:text-primary flex flex-col min-h-screen overflow-x-hidden">
      <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50 shrink-0 transition-all duration-300">
        <div className="flex items-center gap-3 group cursor-pointer hover:opacity-90 transition-opacity">
           <img src="https://i.postimg.cc/pXWMbTZz/20251215-182621.png" alt="RioRuo Logo" className="w-7 h-7 transition-transform duration-500 group-hover:rotate-12 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
          <h1 className="font-bold text-white tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 group-hover:to-white transition-all duration-300">RioRuo API</h1>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setView(view === 'playground' ? 'docs' : 'playground')}
             className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-surfaceLight hover:border-zinc-500 transition-all duration-300 bg-transparent border border-border px-4 py-2 rounded-full active:scale-95"
           >
             {view === 'playground' ? <><BookOpen size={14} /> Documentation</> : <><SlidersHorizontal size={14}/> Playground</>}
           </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 lg:p-8 overflow-y-auto w-full">
        {view === 'playground' ? <Playground /> : <Documentation />}
        
        <footer className="w-full max-w-6xl mx-auto mt-12 pt-8 border-t border-border animate-in fade-in duration-1000 delay-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2 text-zinc-300 group cursor-default">
                <img src="https://i.postimg.cc/pXWMbTZz/20251215-182621.png" alt="Logo" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all duration-300" />
                <span className="font-bold tracking-tight">RioRuo API</span>
              </div>
              <p className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                &copy; {new Date().getFullYear()} Developed with <Heart size={10} className="text-error fill-error animate-pulse" /> by <span className="text-primary font-bold hover:underline cursor-pointer decoration-dotted underline-offset-4">Rio</span>
              </p>
            </div>
            <nav className="flex items-center gap-6">
              <a href="https://github.com/rioxr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-all duration-300 group hover:-translate-y-0.5">
                <Github size={14} className="group-hover:text-white transition-colors" />
                <span>GitHub</span>
              </a>
              <button onClick={() => setView('docs')} className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-all duration-300 group hover:-translate-y-0.5">
                <Code size={14} className="group-hover:text-primary transition-colors" />
                <span>Documentation</span>
              </button>
              <a href="https://status.rioruo.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-all duration-300 group hover:-translate-y-0.5">
                <Globe size={14} className="group-hover:text-info transition-colors" />
                <span>Status</span>
              </a>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}
