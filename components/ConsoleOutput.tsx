
import React, { useState, useEffect } from 'react';
import { Copy, AlertTriangle, CheckCircle, Clock, Database, Terminal, Eye, X } from 'lucide-react';

interface ConsoleOutputProps {
  data: any;
  loading: boolean;
  meta: {
    status: number;
    latency: number;
    timestamp: string;
  };
}

const SyntaxHighlight = ({ json }: { json: any }) => {
  if (!json) return null;
  const jsonString = JSON.stringify(json, null, 2);
  
  const highlighted = jsonString.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return `<span class="${cls}">${match}</span>`;
  });

  return (
    <pre className="font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: highlighted }} />
  );
};

const LoadingState = () => {
  const [loadingMessage, setLoadingMessage] = useState('Initializing Request...');
  const messages = [
    'Sending request...',
    'Awaiting response...',
    'Processing data...',
    'Preparing JSON output...'
  ];

  useEffect(() => {
    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 2500); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[500px] bg-surface border border-border rounded-xl overflow-hidden shadow-2xl flex flex-col relative animate-in fade-in duration-300">
      <div className="h-full flex flex-col items-center justify-center space-y-6">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-surfaceLight rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex flex-col items-center text-center">
          <p className="text-primary font-mono text-sm font-bold tracking-widest animate-pulse">FETCHING DATA</p>
          <p className="text-zinc-500 text-xs font-mono mt-2 transition-all duration-500 h-4">
            {loadingMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ data, loading, meta }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isError = meta.status >= 400 || (data && data.status === 'error');
  const containerClass = "w-full h-[500px] bg-surface border border-border rounded-xl overflow-hidden shadow-2xl flex flex-col relative transition-all duration-300 hover:border-zinc-700";

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  if (loading) {
    return <LoadingState />;
  }

  if (!data) {
    return (
      <div className={`${containerClass} border-dashed group hover:bg-surfaceLight/20`}>
        <div className="h-full flex flex-col items-center justify-center text-center p-8 transition-transform duration-300 group-hover:scale-105">
          <div className="w-16 h-16 bg-surfaceLight rounded-full flex items-center justify-center mb-4 group-hover:bg-surfaceLight/80 transition-colors">
            <Terminal size={32} className="text-zinc-600 group-hover:text-primary transition-colors duration-300" />
          </div>
          <h3 className="text-zinc-300 font-bold mb-2 group-hover:text-white transition-colors">Ready to Fetch</h3>
          <p className="text-zinc-500 text-sm max-w-xs">Select an endpoint and fire a request to see the raw JSON response.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={containerClass}>
        <div className="flex items-center justify-between px-4 py-2 bg-surfaceLight border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isError ? 'bg-error animate-pulse' : 'bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
            <span className="text-xs font-mono text-zinc-400 font-medium">Response Body</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="p-1.5 hover:bg-white/10 rounded transition-all duration-200 text-zinc-400 hover:text-primary active:scale-90"
                title="View Full Raw JSON"
            >
                <Eye size={14} />
            </button>
            <div className="w-px h-4 bg-border mx-1"></div>
            <button 
              onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}
              className="p-1.5 hover:bg-white/10 rounded transition-all duration-200 text-zinc-400 hover:text-white active:scale-90"
              title="Copy to Clipboard"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-[#0d0d0d] custom-scrollbar selection:bg-primary/30 selection:text-white">
          <SyntaxHighlight json={data} />
        </div>

        <div className="border-t border-border bg-surfaceLight p-4 shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1 transition-transform duration-300 hover:translate-x-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Status</span>
              <div className={`flex items-center gap-1.5 font-mono text-sm ${isError ? 'text-error' : 'text-primary'}`}>
                {isError ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                {meta.status} {isError ? 'Error' : 'OK'}
              </div>
            </div>
            
            <div className="flex flex-col gap-1 transition-transform duration-300 hover:translate-x-1">
               <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Latency</span>
               <div className="flex items-center gap-1.5 font-mono text-sm text-zinc-300">
                 <Clock size={14} className="text-zinc-500" />
                 {meta.latency}ms
               </div>
            </div>

            <div className="flex flex-col gap-1 transition-transform duration-300 hover:translate-x-1">
               <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Size</span>
               <div className="flex items-center gap-1.5 font-mono text-sm text-zinc-300">
                 <Database size={14} className="text-zinc-500" />
                 {JSON.stringify(data).length} B
               </div>
            </div>

            <div className="flex flex-col gap-1 transition-transform duration-300 hover:translate-x-1">
               <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Timestamp</span>
               <div className="font-mono text-xs text-zinc-400 mt-0.5">
                 {meta.timestamp}
               </div>
            </div>
          </div>

          {isError && (
            <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h4 className="text-error text-xs font-bold uppercase mb-1 flex items-center gap-2">
                <AlertTriangle size={12} /> Diagnostic Info
              </h4>
              <div className="font-mono text-xs text-red-200">
                <p><span className="text-error opacity-70">Message:</span> {data.message || "Unknown error occurred"}</p>
                {data.endpoint && <p><span className="text-error opacity-70">Endpoint:</span> {data.endpoint}</p>}
                {data.hint && <p><span className="text-error opacity-70">Hint:</span> {data.hint}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raw Response Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="bg-[#0d0d0d] border border-border w-full max-w-5xl h-full max-h-[85vh] rounded-xl shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
             {/* Modal Header */}
             <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surfaceLight shrink-0">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Database size={18} />
                   </div>
                   <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">Raw JSON Response</h3>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">Full detail view</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 rounded-md transition-colors border border-white/5 hover:border-white/10"
                    >
                      <Copy size={14} /> Copy All
                    </button>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                </div>
             </div>
             
             {/* Modal Body */}
             <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                <SyntaxHighlight json={data} />
             </div>

             {/* Modal Footer */}
             <div className="px-6 py-3 bg-surfaceLight border-t border-border text-xs text-zinc-500 font-mono flex justify-between items-center shrink-0">
                <span>{JSON.stringify(data).length} bytes</span>
                <span>CMD+A to select all</span>
             </div>
          </div>
        </div>
      )}
    </>
  );
};
