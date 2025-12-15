import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Code, Terminal, Key, Type, CheckSquare, Asterisk,
  Layout, List, Search, Film, Grid, CalendarDays, ArrowLeft
} from 'lucide-react';

const documentationData = [
  {
    id: 'discovery',
    name: 'Discovery',
    icon: <Layout size={16} />,
    endpoints: [
      {
        path: '/home',
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
        path: '/ongoing-anime/:page?',
        method: 'GET',
        description: 'Mengambil daftar anime yang sedang berlangsung dengan dukungan paginasi.',
        parameters: [
          { name: ':page?', type: 'number', required: false, description: 'Nomor halaman. Default ke 1 jika tidak disediakan.' }
        ],
        example: '/ongoing-anime/2',
        response: 'Objek JSON yang berisi `data` (array anime) dan informasi `pagination`.'
      },
      {
        path: '/complete-anime/:page?',
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
        path: '/search/:keyword',
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
        path: '/anime/:slug',
        method: 'GET',
        description: 'Mengambil detail lengkap dari sebuah anime berdasarkan slug-nya.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari anime (misal: "jujutsu-kaisen-s2").' }
        ],
        example: '/anime/jujutsu-kaisen-s2',
        response: 'Objek JSON tunggal yang berisi semua detail anime.'
      },
      {
        path: '/anime/:slug/episodes',
        method: 'GET',
        description: 'Mengambil daftar semua episode yang tersedia untuk sebuah anime.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari anime.' }
        ],
        example: '/anime/jujutsu-kaisen-s2/episodes',
        response: 'Objek JSON dengan array `data` yang berisi daftar episode.'
      },
      {
        path: '/anime/:slug/episodes/:episode',
        method: 'GET',
        description: 'Mengambil detail episode berdasarkan nomor episodenya.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari anime.' },
          { name: ':episode', type: 'number', required: true, description: 'Nomor episode yang ingin diambil.' }
        ],
        example: '/anime/jujutsu-kaisen-s2/episodes/23',
        response: 'Objek JSON yang berisi detail streaming dan link download untuk episode tersebut.'
      },
      {
        path: '/episode/:slug',
        method: 'GET',
        description: 'Mengambil detail episode berdasarkan slug episode-nya.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari episode (misal: "jujutsu-kaisen-s2-episode-23").' }
        ],
        example: '/episode/jujutsu-kaisen-s2-episode-23',
        response: 'Objek JSON yang berisi detail streaming dan link download untuk episode tersebut.'
      },
      {
        path: '/batch/:slug',
        method: 'GET',
        description: 'Mengambil link download batch berdasarkan slug batch-nya.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari halaman batch (misal: "jujutsu-kaisen-s2-batch").' }
        ],
        example: '/batch/jujutsu-kaisen-s2-batch',
        response: 'Objek JSON yang berisi link download batch dalam berbagai resolusi.'
      },
      {
        path: '/anime/:slug/batch',
        method: 'GET',
        description: 'Mencari dan mengambil link download batch untuk sebuah anime berdasarkan slug animenya (jika tersedia).',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari anime.' }
        ],
        example: '/anime/jujutsu-kaisen-s2/batch',
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
        path: '/genres',
        method: 'GET',
        description: 'Mengambil daftar semua genre yang tersedia di situs.',
        parameters: [],
        example: '/genres',
        response: 'Objek JSON dengan array `data` yang berisi daftar semua genre.'
      },
      {
        path: '/genres/:slug/:page?',
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
            path: '/jadwal-rilis',
            method: 'GET',
            description: 'Mengambil jadwal rilis anime mingguan yang dikelompokkan berdasarkan hari.',
            parameters: [],
            example: '/jadwal-rilis',
            response: 'Objek JSON dengan array `data`, di mana setiap elemen mewakili satu hari dan berisi daftar anime yang rilis pada hari tersebut.'
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
          /otakudesu/v1{endpoint.example}
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
  const mainContentRef = useRef<HTMLDivElement>(null);

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
            {documentationData.map(section => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {section.icon}
                <span>{section.name}</span>
              </button>
            ))}
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