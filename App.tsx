
import React, { useState, useEffect, useCallback } from 'react';
import { ApiEndpoint } from './src/types/types.ts';
import { apiService, BASE_URL } from './frontend-api/api';
import { ConsoleOutput } from './components/ConsoleOutput';
import { Documentation } from './components/Documentation';
import { 
  Terminal, Search, Zap, 
  Settings, Command, Layout, 
  List, Grid, Film, ChevronDown, ChevronRight, Check,
  Github, Heart, Code, Globe, CalendarDays, Cloud,
  BookOpen, SlidersHorizontal, Menu, X, Copy, Link as LinkIcon
} from 'lucide-react';

// Toast component
const Toast: React.FC<{ id: string; message: string; onRemove: (id: string) => void }> = ({ id, message, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const exitTimer = setTimeout(() => setIsVisible(false), 2700);
    const removeTimer = setTimeout(() => onRemove(id), 3000);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [id, onRemove]);

  return (
    <div className={`group relative flex items-center gap-4 pl-4 pr-6 py-4 rounded-r-lg rounded-l-sm shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/5 border-l-0 ${isVisible ? 'animate-in slide-in-from-bottom-full fade-in duration-500 ease-out' : 'animate-out slide-out-to-right-full fade-out duration-300 ease-in'} bg-[#121212]/95 backdrop-blur-md w-full max-w-sm overflow-hidden`} role="alert">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-emerald-400 to-primary"></div>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-primary/20">
        <Check size={16} strokeWidth={3} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5 leading-none">Success</span>
        <span className="text-sm font-medium text-zinc-100 truncate">{message}</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
};

export function App() {
  const [view, setView] = useState<'playground' | 'docs'>('playground');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>(ApiEndpoint.HOME);
  
  // Sidebar & Navigation State
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isOtakudesuExpanded, setOtakudesuExpanded] = useState(true);
  const [isWeatherExpanded, setWeatherExpanded] = useState(true);

  // Request Params
  const [keyword, setKeyword] = useState('jujutsu kaisen');
  const [animeSlug, setAnimeSlug] = useState('1piece-sub-indo');
  const [episodeSlug, setEpisodeSlug] = useState('wpoiec-episode-1152-sub-indo');
  const [batchSlug, setBatchSlug] = useState('wpoiec-batch-sub-indo');
  const [genreSlug, setGenreSlug] = useState('action');
  const [episodeNumber, setEpisodeNumber] = useState('1');
  const [page, setPage] = useState('1');
  const [movieYear, setMovieYear] = useState('2024');
  const [movieMonth, setMovieMonth] = useState('01');
  const [movieTitleSlug, setMovieTitleSlug] = useState('dandadan');
  const [weatherLocation, setWeatherLocation] = useState('Jakarta');

  // Response State
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [requestMeta, setRequestMeta] = useState({ status: 0, latency: 0, timestamp: '-' });
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  // API Status Check
  const checkApiStatus = async () => {
    try {
      setApiStatus('checking');
      const response = await fetch(`${BASE_URL}/v1/health`); 
      if (response.ok) {
        const data = await response.json();
        setApiStatus(data.status === 'OK' ? 'online' : 'offline');
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      setApiStatus('offline');
    }
  };

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 3600000);
    return () => clearInterval(interval);
  }, []);

  const addToast = useCallback((message: string) => {
    const id = Date.now().toString();
    setToasts((prevToasts) => [...prevToasts, { id, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const handleFetch = useCallback(async () => {
    setLoading(true);
    setResponseData(null);
    const startTime = performance.now();
    const timestamp = new Date().toLocaleTimeString();

    try {
      let res;
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
      else if (selectedEndpoint === ApiEndpoint.MOVIES) res = await apiService.getMovies(parseInt(page));
      else if (selectedEndpoint === ApiEndpoint.SINGLE_MOVIE) res = await apiService.getSingleMovie(movieYear, movieMonth, movieTitleSlug);
      else if (selectedEndpoint === ApiEndpoint.JADWAL_RILIS) res = await apiService.getJadwalRilis();
      // Weather Endpoints
      else if (selectedEndpoint === ApiEndpoint.WEATHER) res = await apiService.getWeather(weatherLocation);
      else if (selectedEndpoint === ApiEndpoint.WEATHER_ASCII) res = await apiService.getWeatherAscii(weatherLocation);
      else if (selectedEndpoint === ApiEndpoint.WEATHER_QUICK) res = await apiService.getWeatherQuick(weatherLocation);
      else if (selectedEndpoint === ApiEndpoint.WEATHER_PNG) res = await apiService.getWeatherPng(weatherLocation);
      else res = await apiService.getHome();

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      const status = (res as any).status === 'error' ? 500 : 200;

      setResponseData(res);
      setRequestMeta({ status, latency, timestamp });
    } catch (err: any) {
      const endTime = performance.now();
      const errorStatus = err.message.includes('404') ? 404 : 503;
      setResponseData({ 
        status: "error", 
        message: err.message || "Network Failed or Backend Unreachable",
        hint: "Make sure the backend server is running and accessible." 
      });
      setRequestMeta({ status: errorStatus, latency: Math.round(endTime - startTime), timestamp });
    } finally {
      setLoading(false);
    }
  }, [selectedEndpoint, keyword, page, animeSlug, episodeNumber, episodeSlug, genreSlug, batchSlug, movieYear, movieMonth, movieTitleSlug, weatherLocation]);

  // Input rendering logic
  const renderInputs = useCallback(() => {
    const inputs = [];
    
    if (selectedEndpoint === ApiEndpoint.SEARCH) {
      inputs.push(
        <div key="keyword" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Search Keyword</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-white" placeholder="e.g. Naruto" />
          </div>
        </div>
      );
    }
    
    if ([ApiEndpoint.ANIME_DETAIL, ApiEndpoint.ANIME_EPISODES, ApiEndpoint.BATCH_BY_ANIME_SLUG, ApiEndpoint.EPISODE_BY_NUMBER].includes(selectedEndpoint as ApiEndpoint)) {
      inputs.push(
        <div key="animeSlug" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Anime Slug</label>
          <input type="text" value={animeSlug} onChange={(e) => setAnimeSlug(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono" placeholder="e.g. one-piece" />
        </div>
      );
    }

    if (selectedEndpoint === ApiEndpoint.EPISODE_BY_NUMBER) {
      inputs.push(
        <div key="episodeNumber" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Episode Number</label>
          <input type="number" value={episodeNumber} onChange={(e) => setEpisodeNumber(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono" placeholder="e.g. 1" />
        </div>
      );
    }

    if (selectedEndpoint === ApiEndpoint.EPISODE_DETAIL) {
      inputs.push(
        <div key="episodeSlug" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Episode Slug</label>
          <input type="text" value={episodeSlug} onChange={(e) => setEpisodeSlug(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono" placeholder="e.g. one-piece-episode-1" />
        </div>
      );
    }

    if (selectedEndpoint === ApiEndpoint.BATCH_DETAIL) {
      inputs.push(
        <div key="batchSlug" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Batch Slug</label>
          <input type="text" value={batchSlug} onChange={(e) => setBatchSlug(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono" placeholder="e.g. jujutsu-kaisen-s2-batch" />
        </div>
      );
    }

    if (selectedEndpoint === ApiEndpoint.GENRE_DETAIL) {
      inputs.push(
        <div key="genreSlug" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Genre Slug</label>
          <input type="text" value={genreSlug} onChange={(e) => setGenreSlug(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono" placeholder="e.g. action" />
        </div>
      );
    }

    if (selectedEndpoint === ApiEndpoint.SINGLE_MOVIE) {
      inputs.push(
        <div key="movieYear" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Movie Year</label>
          <input type="text" value={movieYear} onChange={(e) => setMovieYear(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono" placeholder="e.g. 2024" />
        </div>
      );
      inputs.push(
        <div key="movieMonth" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Movie Month</label>
          <input type="text" value={movieMonth} onChange={(e) => setMovieMonth(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono" placeholder="e.g. 01" />
        </div>
      );
      inputs.push(
        <div key="movieTitleSlug" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Movie Title Slug</label>
          <input type="text" value={movieTitleSlug} onChange={(e) => setMovieTitleSlug(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono" placeholder="e.g. dandadan" />
        </div>
      );
    }

    if ([ApiEndpoint.ONGOING, ApiEndpoint.COMPLETED, ApiEndpoint.GENRE_DETAIL, ApiEndpoint.MOVIES].includes(selectedEndpoint as ApiEndpoint)) {
      inputs.push(
        <div key="pg" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Page</label>
          <input type="number" value={page} onChange={(e) => setPage(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white" placeholder="1" />
        </div>
      );
    }

    if ([ApiEndpoint.WEATHER, ApiEndpoint.WEATHER_ASCII, ApiEndpoint.WEATHER_QUICK, ApiEndpoint.WEATHER_PNG].includes(selectedEndpoint as ApiEndpoint)) {
      inputs.push(
        <div key="weatherLocation" className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Location</label>
          <input type="text" value={weatherLocation} onChange={(e) => setWeatherLocation(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 text-sm focus:border-primary focus:outline-none text-white font-mono" placeholder="e.g. Jakarta" />
        </div>
      );
    }

    return inputs.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">{inputs}</div> : null;
  }, [selectedEndpoint, keyword, animeSlug, episodeSlug, batchSlug, genreSlug, episodeNumber, page, movieYear, movieMonth, movieTitleSlug, weatherLocation]);

  const otakudesuCategories = [
    { id: 'discovery', name: "Discovery", icon: <Layout size={14} />, items: [ApiEndpoint.HOME] },
    { id: 'lists', name: "Lists", icon: <List size={14} />, items: [ApiEndpoint.ONGOING, ApiEndpoint.COMPLETED] },
    { id: 'search', name: "Search", icon: <Search size={14} />, items: [ApiEndpoint.SEARCH] },
    { id: 'details', name: "Details", icon: <Film size={14} />, items: [ApiEndpoint.ANIME_DETAIL, ApiEndpoint.ANIME_EPISODES, ApiEndpoint.EPISODE_BY_NUMBER, ApiEndpoint.EPISODE_DETAIL, ApiEndpoint.BATCH_DETAIL, ApiEndpoint.BATCH_BY_ANIME_SLUG] },
    { id: 'metadata', name: "Metadata", icon: <Grid size={14} />, items: [ApiEndpoint.GENRES, ApiEndpoint.GENRE_DETAIL] },
    { id: 'movies', name: "Movies", icon: <Film size={14} />, items: [ApiEndpoint.MOVIES, ApiEndpoint.SINGLE_MOVIE] }, 
    { id: 'schedule', name: "Schedule", icon: <CalendarDays size={14} />, items: [ApiEndpoint.JADWAL_RILIS]}, 
  ];

  const weatherCategories = [
    { id: 'weather', name: "Weather Data", icon: <Cloud size={14} />, items: [ApiEndpoint.WEATHER, ApiEndpoint.WEATHER_ASCII, ApiEndpoint.WEATHER_QUICK, ApiEndpoint.WEATHER_PNG] }, 
  ];

  const displayBaseUrl = 'https://rioruo.vercel.app';
  
  const Playground = useCallback(() => (
    <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col gap-6">
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Request Controller */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-lg relative z-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Command size={20} className="text-primary" />
              <h2 className="text-xl font-bold text-white">Request Controller</h2>
            </div>
            <a href="https://rioruo.vercel.app/v1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-mono bg-surfaceLight border border-border px-3 py-1.5 rounded-full hover:border-zinc-600 transition-colors">
              <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-primary' : apiStatus === 'offline' ? 'bg-error' : 'bg-warning'} ${(apiStatus === 'checking' || apiStatus === 'offline') ? 'animate-pulse' : ''}`}></div>
              <span className="text-zinc-400">{apiStatus === 'online' ? 'API Status' : apiStatus === 'offline' ? 'API Offline' : 'Checking API...'}</span>
            </a>
          </div>
          
          <div className="mb-8">
            <div className="flex flex-col gap-2">
               <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Request Configuration</label>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-auto md:h-[60px]">
                  {/* Method */}
                  <div className="md:col-span-2 h-full bg-surfaceLight/30 border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                     <span className="relative font-mono font-black text-primary tracking-widest text-lg">GET</span>
                  </div>

                  {/* Base URL */}
                  <div className="md:col-span-4 h-full bg-[#09090b] border border-border rounded-xl flex flex-col justify-center px-4 py-2 relative group hover:border-zinc-700 transition-all">
                     <span className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest mb-0.5 flex items-center gap-1.5">
                       <Globe size={10} /> Base URL
                     </span>
                     <div className="font-mono text-xs md:text-sm text-zinc-400 truncate select-all">{displayBaseUrl}</div>
                  </div>

                  {/* Endpoint */}
                  <div className="md:col-span-6 h-full bg-[#09090b] border border-border rounded-xl flex items-center relative group hover:border-primary/30 transition-all overflow-hidden">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50"></div>
                     
                     <div className="flex-1 flex flex-col justify-center px-4 py-2 min-w-0">
                        <span className="text-[9px] uppercase font-bold text-primary tracking-widest mb-0.5 flex items-center gap-1.5">
                           <Terminal size={10} /> Endpoint
                        </span>
                        <div className="font-mono text-xs md:text-sm text-white truncate">{selectedEndpoint}</div>
                     </div>

                     <div className="pr-2 pl-2 border-l border-white/5 h-1/2 flex items-center">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${displayBaseUrl}${selectedEndpoint}`);
                            addToast('URL copied to clipboard');
                          }}
                          className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Copy Full URL"
                        >
                          <Copy size={16} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
          
          {renderInputs()}
          
          <div className="flex justify-end pt-4 border-t border-white/5">
            <button onClick={handleFetch} disabled={loading} className="bg-primary hover:bg-emerald-400 text-black font-bold py-2.5 px-8 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center">
              {loading ? <Settings className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
              <span>SEND REQUEST</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 min-h-[500px]">
          <ConsoleOutput data={responseData} loading={loading} meta={requestMeta} onCopySuccess={addToast} />
        </div>
      </div>
    </div>
  ), [apiStatus, displayBaseUrl, selectedEndpoint, otakudesuCategories, weatherCategories, renderInputs, handleFetch, loading, responseData, requestMeta, addToast]);

  return (
    <div className="min-h-screen bg-background text-zinc-300 font-sans selection:bg-primary/20 selection:text-primary flex flex-col min-h-screen relative">
      
      {/* Sidebar Overlay and Drawer */}
      <div className={`fixed inset-0 z-[100] transition-visibility duration-300 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Sidebar Drawer */}
        <div className={`absolute left-0 top-0 bottom-0 w-80 bg-[#0c0c0c] border-r border-border shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 bg-surface/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
               <img 
                  src="https://i.postimg.cc/pXWMbTZz/20251215-182621.png" 
                  alt="RioRuo Logo" 
                  className="w-8 h-8 rounded-lg drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] mix-blend-screen" 
               />
               <div>
                 <h2 className="font-bold text-white text-sm tracking-tight">RioRuo API</h2>
                 <p className="text-[10px] text-zinc-500 font-mono">v1.0.0</p>
               </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/5"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            
            {/* Menu Section */}
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-2">ENDPOINT LIST</h3>
              
              {/* Otakudesu Item */}
              <div className="space-y-1 mb-4">
                <button 
                  onClick={() => setOtakudesuExpanded(!isOtakudesuExpanded)}
                  className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isOtakudesuExpanded 
                      ? 'bg-surfaceLight border-white/5 text-white shadow-sm' 
                      : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Visual indicator bar for active state */}
                    <div className={`w-1 h-4 rounded-full transition-colors ${isOtakudesuExpanded ? 'bg-primary' : 'bg-zinc-700 group-hover:bg-zinc-500'}`} />
                    <span>Otakudesu</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-zinc-500 transition-transform duration-300 ${isOtakudesuExpanded ? 'rotate-180 text-primary' : ''}`} 
                  />
                </button>

                {/* Submenu */}
                <div className={`grid transition-all duration-300 ease-in-out ${isOtakudesuExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="pt-2 pb-2 pl-4 space-y-6 relative">
                      {/* Vertical connector line */}
                      <div className="absolute left-[21px] top-0 bottom-0 w-px bg-white/5" />

                      {otakudesuCategories.map((cat) => (
                        <div key={cat.id} className="relative">
                          {/* Category Header */}
                          <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
                             <div className="text-zinc-500">{cat.icon}</div>
                             <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{cat.name}</span>
                          </div>
                          
                          {/* Endpoints List */}
                          <div className="space-y-0.5 border-l border-white/5 ml-3 pl-2">
                            {cat.items.map((endpoint) => {
                              const isSelected = selectedEndpoint === endpoint;
                              return (
                                <button
                                  key={endpoint}
                                  onClick={() => {
                                    setSelectedEndpoint(endpoint);
                                    setSidebarOpen(false);
                                  }}
                                  className={`relative flex items-center w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all duration-200 group/item ${
                                    isSelected
                                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                                      : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                                  }`}
                                >
                                  {/* Selection Dot */}
                                  {isSelected && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-[13px] w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                  )}
                                  
                                  <span className="truncate">{endpoint}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather Item - SEPARATED */}
              <div className="space-y-1">
                <button 
                  onClick={() => setWeatherExpanded(!isWeatherExpanded)}
                  className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isWeatherExpanded 
                      ? 'bg-surfaceLight border-white/5 text-white shadow-sm' 
                      : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Visual indicator bar for active state */}
                    <div className={`w-1 h-4 rounded-full transition-colors ${isWeatherExpanded ? 'bg-info' : 'bg-zinc-700 group-hover:bg-zinc-500'}`} />
                    <span>Weather</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-zinc-500 transition-transform duration-300 ${isWeatherExpanded ? 'rotate-180 text-info' : ''}`} 
                  />
                </button>

                {/* Submenu */}
                <div className={`grid transition-all duration-300 ease-in-out ${isWeatherExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="pt-2 pb-2 pl-4 space-y-6 relative">
                      {/* Vertical connector line */}
                      <div className="absolute left-[21px] top-0 bottom-0 w-px bg-white/5" />

                      {weatherCategories.map((cat) => (
                        <div key={cat.id} className="relative">
                          {/* Category Header */}
                          <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
                             <div className="text-zinc-500">{cat.icon}</div>
                             <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{cat.name}</span>
                          </div>
                          
                          {/* Endpoints List */}
                          <div className="space-y-0.5 border-l border-white/5 ml-3 pl-2">
                            {cat.items.map((endpoint) => {
                              const isSelected = selectedEndpoint === endpoint;
                              return (
                                <button
                                  key={endpoint}
                                  onClick={() => {
                                    setSelectedEndpoint(endpoint);
                                    setSidebarOpen(false);
                                  }}
                                  className={`relative flex items-center w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all duration-200 group/item ${
                                    isSelected
                                      ? 'bg-info/10 text-info border border-info/20 shadow-sm'
                                      : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                                  }`}
                                >
                                  {/* Selection Dot */}
                                  {isSelected && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-[13px] w-1.5 h-1.5 rounded-full bg-info shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                  )}
                                  
                                  <span className="truncate">{endpoint}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      <header className="h-14 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 mr-1 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-white transition-colors"
            aria-label="Open Menu"
          >
            <Menu size={20} />
          </button>
          <img 
            src="https://i.postimg.cc/pXWMbTZz/20251215-182621.png" 
            alt="RioRuo Logo" 
            className="w-8 h-8 rounded-lg drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] mix-blend-screen" 
          />
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

      <main className="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto w-full">
        {view === 'playground' ? <Playground /> : <Documentation />}
        
        <footer className="w-full max-w-7xl mx-auto mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2 text-zinc-300">
                <img 
                  src="https://i.postimg.cc/pXWMbTZz/20251215-182621.png" 
                  alt="RioRuo Logo" 
                  className="w-5 h-5 rounded-md mix-blend-screen" 
                />
                <span className="font-bold tracking-tight">RioRuo API</span>
              </div>
              <p className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                &copy; {new Date().getFullYear()} Developed with <Heart size={10} className="text-error fill-error animate-pulse" /> by <span className="text-primary font-bold">Rio</span>
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
             <Toast id={toast.id} message={toast.message} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </div>
  );
}
