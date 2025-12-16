
import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Code, Terminal, Key, Type, CheckSquare, Asterisk,
  Layout, List, Search, Film, Grid, CalendarDays, Cloud, ArrowLeft, ChevronDown, Book, Quote
} from 'lucide-react';

const documentationData = [
  {
    id: 'discovery',
    name: 'Discovery',
    icon: <Layout size={16} />,
    endpoints: [
      {
        path: '/v1/home',
        method: 'GET',
        description: 'Mengambil daftar anime yang sedang berlangsung (ongoing) dan yang sudah tamat (completed) yang ditampilkan di halaman utama.',
        parameters: [],
        example: '/home',
        response: 'Objek JSON berisi dua array: `ongoing_anime` dan `complete_anime`.'
      }
    ]
  },
  {
    id: 'lists',
    name: 'Lists',
    icon: <List size={16} />,
    endpoints: [
      {
        path: '/v1/ongoing-anime/:page?',
        method: 'GET',
        description: 'Mengambil daftar anime yang sedang berlangsung dengan dukungan paginasi.',
        parameters: [
          { name: ':page?', type: 'number', required: false, description: 'Nomor halaman. Default ke 1 jika tidak disediakan.' }
        ],
        example: '/ongoing-anime/2',
        response: 'Objek JSON yang berisi `data` (array anime) dan informasi `pagination`.'
      },
      {
        path: '/v1/complete-anime/:page?',
        method: 'GET',
        description: 'Mengambil daftar anime yang sudah tamat dengan dukungan paginasi.',
        parameters: [
          { name: ':page?', type: 'number', required: false, description: 'Nomor halaman. Default ke 1 jika tidak disediakan.' }
        ],
        example: '/complete-anime/5',
        response: 'Objek JSON yang berisi `data` (array anime) dan informasi `pagination`.'
      }
    ]
  },
  {
    id: 'search',
    name: 'Search',
    icon: <Search size={16} />,
    endpoints: [
      {
        path: '/v1/search/:keyword',
        method: 'GET',
        description: 'Mencari anime berdasarkan kata kunci yang diberikan.',
        parameters: [
          { name: ':keyword', type: 'string', required: true, description: 'Kata kunci untuk pencarian anime (misal: "naruto").' }
        ],
        example: '/search/jujutsu kaisen',
        response: 'Objek JSON dengan array `data` yang berisi hasil pencarian.'
      }
    ]
  },
  {
    id: 'details',
    name: 'Details',
    icon: <Film size={16} />,
    endpoints: [
      {
        path: '/v1/anime/:slug',
        method: 'GET',
        description: 'Mengambil detail lengkap dari sebuah anime berdasarkan slug-nya.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari anime (misal: "1piece-sub-indo").' }
        ],
        example: '/anime/1piece-sub-indo',
        response: 'Objek JSON tunggal yang berisi semua detail anime.'
      },
      {
        path: '/v1/anime/:slug/episodes',
        method: 'GET',
        description: 'Mengambil daftar semua episode yang tersedia untuk sebuah anime.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari anime.' }
        ],
        example: '/anime/1piece-sub-indo/episodes',
        response: 'Objek JSON dengan array `data` yang berisi daftar episode.'
      },
      {
        path: '/v1/anime/:slug/episodes/:episode',
        method: 'GET',
        description: 'Mengambil detail episode berdasarkan nomor episodenya.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari anime.' },
          { name: ':episode', type: 'number', required: true, description: 'Nomor episode yang ingin diambil.' }
        ],
        example: '/anime/1piece-sub-indo/episodes/1',
        response: 'Objek JSON yang berisi detail streaming dan link download untuk episode tersebut.'
      },
      {
        path: '/v1/episode/:slug',
        method: 'GET',
        description: 'Mengambil detail episode berdasarkan slug episode-nya.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari episode (misal: "wpoiec-episode-1152-sub-indo").' }
        ],
        example: '/episode/wpoiec-episode-1152-sub-indo',
        response: 'Objek JSON yang berisi detail streaming dan link download untuk episode tersebut.'
      },
      {
        path: '/v1/batch/:slug',
        method: 'GET',
        description: 'Mengambil link download batch berdasarkan slug batch-nya.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari halaman batch (misal: "wpoiec-batch-sub-indo").' }
        ],
        example: '/batch/wpoiec-batch-sub-indo',
        response: 'Objek JSON yang berisi link download batch dalam berbagai resolusi.'
      },
      {
        path: '/v1/anime/:slug/batch',
        method: 'GET',
        description: 'Mencari dan mengambil link download batch untuk sebuah anime berdasarkan slug animenya (jika tersedia).',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari anime.' }
        ],
        example: '/anime/1piece-sub-indo/batch',
        response: 'Objek JSON yang berisi link download batch atau pesan error 404 jika tidak ditemukan.'
      }
    ]
  },
  {
    id: 'metadata',
    name: 'Metadata',
    icon: <Grid size={16} />,
    endpoints: [
      {
        path: '/v1/genres',
        method: 'GET',
        description: 'Mengambil daftar semua genre yang tersedia di situs.',
        parameters: [],
        example: '/genres',
        response: 'Objek JSON dengan array `data` yang berisi daftar semua genre.'
      },
      {
        path: '/v1/genres/:slug/:page?',
        method: 'GET',
        description: 'Mengambil daftar anime berdasarkan genre tertentu dengan dukungan paginasi.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug dari genre (misal: "action").' },
          { name: ':page?', type: 'number', required: false, description: 'Nomor halaman. Default ke 1.' }
        ],
        example: '/genres/action/2',
        response: 'Objek JSON yang berisi `anime` (array anime) dan informasi `pagination`.'
      }
    ]
  },
  {
    id: 'schedule',
    name: 'Schedule',
    icon: <CalendarDays size={16} />,
    endpoints: [
        {
            path: '/v1/jadwal-rilis',
            method: 'GET',
            description: 'Mengambil jadwal rilis anime mingguan yang dikelompokkan berdasarkan hari.',
            parameters: [],
            example: '/jadwal-rilis',
            response: 'Objek JSON dengan array `data`, di mana setiap elemen mewakili satu hari dan berisi daftar anime yang rilis pada hari tersebut.'
        }
    ]
  },
  {
    id: 'quotes',
    name: 'Goodreads Quotes',
    icon: <Quote size={16} />,
    endpoints: [
        {
            path: '/v1/quote/quotes',
            method: 'GET',
            description: 'Mengambil daftar quote populer dari Goodreads dengan paginasi.',
            parameters: [
                { name: '?page', type: 'number', required: false, description: 'Nomor halaman. Default ke 1.' }
            ],
            example: '/quote/quotes?page=1',
            response: 'Objek JSON berisi array `quotes`.'
        },
        {
            path: '/v1/quote/quotes/tag/:tag',
            method: 'GET',
            description: 'Mengambil daftar quote berdasarkan tag tertentu dari Goodreads.',
            parameters: [
                { name: ':tag', type: 'string', required: true, description: 'Tag quote (misal: "love", "life").' },
                { name: '?page', type: 'number', required: false, description: 'Nomor halaman. Default ke 1.' }
            ],
            example: '/quote/quotes/tag/love?page=1',
            response: 'Objek JSON berisi array `quotes`.'
        }
    ]
  },
  {
    id: 'komiku',
    name: 'Komiku',
    icon: <Book size={16} />,
    endpoints: [
        {
            path: '/v1/manga/page/:page?',
            method: 'GET',
            description: 'Mengambil daftar manga terbaru dengan paginasi dari Komiku.',
            parameters: [
                { name: ':page?', type: 'number', required: false, description: 'Nomor halaman. Default: 1.' }
            ],
            example: '/manga/page/1',
            response: 'Objek JSON berisi array `manga_list`.'
        },
        {
            path: '/v1/manga/popular/:page?',
            method: 'GET',
            description: 'Mengambil daftar manga populer/rekomendasi.',
            parameters: [
                { name: ':page?', type: 'number', required: false, description: 'Nomor halaman. Default: 1.' }
            ],
            example: '/manga/popular/1',
            response: 'Objek JSON berisi array `manga_list` dengan detail rekomendasi.'
        },
        {
            path: '/v1/manga/detail/:endpoint',
            method: 'GET',
            description: 'Mengambil detail lengkap manga, termasuk sinopsis dan daftar chapter.',
            parameters: [
                { name: ':endpoint', type: 'string', required: true, description: 'Slug atau endpoint manga.' }
            ],
            example: '/manga/detail/one-piece',
            response: 'Objek JSON detail manga.'
        },
        {
            path: '/v1/manga/search/:query',
            method: 'GET',
            description: 'Mencari manga berdasarkan query.',
            parameters: [
                { name: ':query', type: 'string', required: true, description: 'Kata kunci pencarian.' }
            ],
            example: '/manga/search/naruto',
            response: 'Objek JSON berisi hasil pencarian.'
        },
        {
            path: '/v1/manga/genre',
            method: 'GET',
            description: 'Mengambil daftar genre manga yang tersedia.',
            parameters: [],
            example: '/manga/genre',
            response: 'Objek JSON berisi list genre.'
        },
        {
            path: '/v1/manga/genre/:endpoint',
            method: 'GET',
            description: 'Mengambil daftar manga berdasarkan genre.',
            parameters: [
                { name: ':endpoint', type: 'string', required: true, description: 'Slug genre.' }
            ],
            example: '/manga/genre/action',
            response: 'Objek JSON daftar manga dalam genre tersebut.'
        },
        {
            path: '/v1/manga/recommended',
            method: 'GET',
            description: 'Mengambil manga yang sedang hot/direkomendasikan.',
            parameters: [],
            example: '/manga/recommended',
            response: 'Objek JSON daftar manga hot.'
        },
        {
            path: '/v1/chapter/:title',
            method: 'GET',
            description: 'Mengambil gambar-gambar dari chapter tertentu.',
            parameters: [
                { name: ':title', type: 'string', required: true, description: 'Slug chapter.' }
            ],
            example: '/chapter/one-piece-chapter-1100',
            response: 'Objek JSON berisi array link gambar chapter.'
        }
    ]
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: <Cloud size={16} />,
    endpoints: [
        {
            path: '/v1/weather/:location',
            method: 'GET',
            description: 'Mengambil data cuaca lengkap dalam format JSON dari wttr.in.',
            parameters: [
                { name: ':location', type: 'string', required: true, description: 'Nama lokasi (kota) yang ingin dicek cuacanya.' },
                { name: '?lang', type: 'string', required: false, description: 'Kode bahasa (ISO 639-1). Default: "en".' }
            ],
            example: '/weather/Jakarta?lang=id',
            response: 'Objek JSON berisi data cuaca lengkap.'
        },
        {
            path: '/v1/weather/ascii/:location',
            method: 'GET',
            description: 'Mengambil tampilan cuaca dalam format ASCII art.',
            parameters: [
                { name: ':location', type: 'string', required: true, description: 'Nama lokasi.' },
                { name: '?lang', type: 'string', required: false, description: 'Kode bahasa. Default: "en".' }
            ],
            example: '/weather/ascii/Bandung?lang=id',
            response: 'String text (ASCII Art) atau JSON jika parameter format=json digunakan.'
        },
        {
            path: '/v1/weather/quick/:location',
            method: 'GET',
            description: 'Info cuaca singkat satu baris dengan format yang ditentukan (Conditions, Temperature, Humidity, Wind). Bahasa output dapat disesuaikan.',
            parameters: [
                { name: ':location', type: 'string', required: true, description: 'Nama lokasi.' },
                { name: '?lang', type: 'string', required: false, description: 'Kode bahasa (ISO 639-1) untuk output teks cuaca. Default: "en". Contoh: "id" untuk Bahasa Indonesia.' }
            ],
            example: '/weather/quick/Surabaya?lang=id',
            response: 'Objek JSON berisi string cuaca singkat dalam bahasa yang dipilih.'
        },
        {
            path: '/v1/weather/png/:location',
            method: 'GET',
            description: 'Mengambil gambar PNG cuaca.',
            parameters: [
                { name: ':location', type: 'string', required: true, description: 'Nama lokasi.' }
            ],
            example: '/weather/png/Bali',
            response: 'Binary image file (PNG).'
        }
    ]
  }
];

// FIX: Define prop types for EndpointCard to resolve type error when passing `key` prop.
type Endpoint = typeof documentationData[number]['endpoints'][number];

interface EndpointCardProps {
  endpoint: Endpoint;
}

// FIX: Changed the component to be of type React.FC. This correctly handles React's special `key` prop, which is required when rendering lists of components, and resolves the TypeScript error.
const EndpointCard: React.FC<EndpointCardProps> = ({ endpoint }) => (
  <div className="bg-surface border border-border rounded-xl mb-8 overflow-hidden">
    <div className="px-5 py-4 bg-surfaceLight border-b border-border">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded">{endpoint.method}</span>
        <code className="text-sm font-semibold text-white tracking-wide">{endpoint.path}</code>
      </div>
      <p className="text-zinc-400 text-sm mt-2">{endpoint.description}</p>
    </div>
    
    <div className="p-5">
      {endpoint.parameters.length > 0 && (
        <>
          <h4 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2"><Key size={14}/> Parameters</h4>
          <div className="space-y-3">
            {endpoint.parameters.map(param => (
              <div key={param.name} className="grid grid-cols-1 md:grid-cols-12 gap-2 text-sm">
                <div className="md:col-span-3 flex items-center gap-2">
                  <code className="font-mono text-primary">{param.name}</code>
                  {param.required ? <Asterisk size={12} className="text-error"/> : <CheckSquare size={12} className="text-zinc-500"/>}
                </div>
                <div className="md:col-span-2 text-zinc-400 font-mono flex items-center gap-2"><Type size={14}/> {param.type}</div>
                <div className="md:col-span-7 text-zinc-500">{param.description}</div>
              </div>
            ))}
          </div>
          <div className="border-b border-border my-5"></div>
        </>
      )}

      <div>
        <h4 className="text-sm font-bold text-zinc-300 mb-2 flex items-center gap-2"><Code size={14}/> Example Request</h4>
        <code className="w-full block bg-surfaceLight border border-border rounded-lg p-3 text-sm text-emerald-300 font-mono break-all">
          /v1{endpoint.example}
        </code>
      </div>
       <div className="mt-4">
        <h4 className="text-sm font-bold text-zinc-300 mb-2 flex items-center gap-2"><Terminal size={14}/> Expected Response</h4>
        <p className="text-sm text-zinc-400">{endpoint.response}</p>
      </div>
    </div>
  </div>
);

export function Documentation() {
  const [activeSection, setActiveSection] = useState(documentationData[0].id);
  const [isOtakudesuExpanded, setOtakudesuExpanded] = useState(true);
  const [isWeatherExpanded, setWeatherExpanded] = useState(false);
  const [isKomikuExpanded, setKomikuExpanded] = useState(false);
  const [isQuotesExpanded, setQuotesExpanded] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const otakudesuDocs = documentationData.filter(sect => sect.id !== 'weather' && sect.id !== 'komiku' && sect.id !== 'quotes');
  const weatherDocs = documentationData.filter(sect => sect.id === 'weather');
  const komikuDocs = documentationData.filter(sect => sect.id === 'komiku');
  const quoteDocs = documentationData.filter(sect => sect.id === 'quotes');

  useEffect(() => {
    const handleScroll = () => {
      const mainNode = mainContentRef.current;
      if (!mainNode) return;

      let currentSectionId = activeSection;
      for (const section of documentationData) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if section is in the top part of the viewport
          if (rect.top >= 0 && rect.top < 150) {
            currentSectionId = section.id;
            break;
          }
        }
      }
      setActiveSection(currentSectionId);
    };

    const mainEl = mainContentRef.current;
    mainEl?.addEventListener('scroll', handleScroll);
    return () => mainEl?.removeEventListener('scroll', handleScroll);
  }, [activeSection]);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-8 animate-in fade-in duration-300">
      {/* Sidebar */}
      <aside className="md:w-1/4 md:sticky md:top-20 self-start">
         <div className="p-1 bg-surface border border-border rounded-xl">
           <h3 className="flex items-center gap-2 text-sm font-bold text-white p-3"><BookOpen size={16} className="text-primary"/> API Endpoints</h3>
           <nav className="flex flex-col gap-1 p-2">
            
            {/* Otakudesu Group Wrapper */}
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
                    <div className={`w-1 h-4 rounded-full transition-colors ${isOtakudesuExpanded ? 'bg-primary' : 'bg-zinc-700 group-hover:bg-zinc-500'}`} />
                    <span>Otakudesu</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-zinc-500 transition-transform duration-300 ${isOtakudesuExpanded ? 'rotate-180 text-primary' : ''}`} 
                  />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out pl-4 ${isOtakudesuExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden border-l border-white/5 ml-2 pl-2 pt-1 space-y-1">
                    {otakudesuDocs.map(section => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-xs transition-colors font-mono group ${
                          activeSection === section.id
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className={`transition-colors ${activeSection === section.id ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                           {section.icon}
                        </div>
                        <span>{section.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
            </div>

            {/* Komiku Group Wrapper */}
            <div className="space-y-1 mb-4">
                <button 
                  onClick={() => setKomikuExpanded(!isKomikuExpanded)}
                  className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isKomikuExpanded 
                      ? 'bg-surfaceLight border-white/5 text-white shadow-sm' 
                      : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-4 rounded-full transition-colors ${isKomikuExpanded ? 'bg-warning' : 'bg-zinc-700 group-hover:bg-zinc-500'}`} />
                    <span>Komiku</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-zinc-500 transition-transform duration-300 ${isKomikuExpanded ? 'rotate-180 text-warning' : ''}`} 
                  />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out pl-4 ${isKomikuExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden border-l border-white/5 ml-2 pl-2 pt-1 space-y-1">
                    {komikuDocs.map(section => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-xs transition-colors font-mono group ${
                          activeSection === section.id
                            ? 'bg-warning/10 text-warning border border-warning/20'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className={`transition-colors ${activeSection === section.id ? 'text-warning' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                           {section.icon}
                        </div>
                        <span>{section.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
            </div>

            {/* Quotes Group Wrapper */}
            <div className="space-y-1 mb-4">
                <button 
                  onClick={() => setQuotesExpanded(!isQuotesExpanded)}
                  className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isQuotesExpanded 
                      ? 'bg-surfaceLight border-white/5 text-white shadow-sm' 
                      : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-4 rounded-full transition-colors ${isQuotesExpanded ? 'bg-purple-500' : 'bg-zinc-700 group-hover:bg-zinc-500'}`} />
                    <span>Quotes</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-zinc-500 transition-transform duration-300 ${isQuotesExpanded ? 'rotate-180 text-purple-500' : ''}`} 
                  />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out pl-4 ${isQuotesExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden border-l border-white/5 ml-2 pl-2 pt-1 space-y-1">
                    {quoteDocs.map(section => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-xs transition-colors font-mono group ${
                          activeSection === section.id
                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className={`transition-colors ${activeSection === section.id ? 'text-purple-500' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                           {section.icon}
                        </div>
                        <span>{section.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
            </div>

            {/* Weather Group Wrapper */}
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
                    <div className={`w-1 h-4 rounded-full transition-colors ${isWeatherExpanded ? 'bg-info' : 'bg-zinc-700 group-hover:bg-zinc-500'}`} />
                    <span>Weather</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-zinc-500 transition-transform duration-300 ${isWeatherExpanded ? 'rotate-180 text-info' : ''}`} 
                  />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out pl-4 ${isWeatherExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden border-l border-white/5 ml-2 pl-2 pt-1 space-y-1">
                    {weatherDocs.map(section => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-xs transition-colors font-mono group ${
                          activeSection === section.id
                            ? 'bg-info/10 text-info border border-info/20'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className={`transition-colors ${activeSection === section.id ? 'text-info' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                           {section.icon}
                        </div>
                        <span>{section.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
            </div>

           </nav>
         </div>
      </aside>

      {/* Main Content */}
      <main ref={mainContentRef} className="md:w-3/4 md:max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-2">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">API Documentation</h1>
            <p className="text-zinc-400 mt-2">Panduan lengkap untuk menggunakan RioRuo API. Semua endpoint mengembalikan respons dalam format JSON.</p>
        </div>
        
        {documentationData.map(section => (
          <section key={section.id} id={section.id} className="pt-4 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b-2 border-primary/20 flex items-center gap-3">
                {section.icon} {section.name}
            </h2>
            {section.endpoints.map(endpoint => (
              <EndpointCard key={endpoint.path} endpoint={endpoint} />
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
