import React from 'react';
import { Copy, AlertTriangle, CheckCircle, Clock, Database, Terminal } from 'lucide-react';

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
  
  // Basic Regex for syntax highlighting (Key, String, Number, Boolean, Null)
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

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ data, loading, meta }) => {
  const isError = meta.status >= 400 || (data && data.status === 'error');

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 min-h-[400px]">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-surfaceLight rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-primary font-mono text-sm font-bold tracking-widest animate-pulse">ESTABLISHING CONNECTION</p>
          <p className="text-zinc-500 text-xs font-mono mt-1">Downloading payload...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[400px] border-2 border-dashed border-border rounded-xl">
        <div className="w-16 h-16 bg-surfaceLight rounded-full flex items-center justify-center mb-4">
          <Terminal size={32} className="text-zinc-600" />
        </div>
        <h3 className="text-zinc-300 font-bold mb-2">Ready to Scrape</h3>
        <p className="text-zinc-500 text-sm max-w-xs">Select an endpoint and fire a request to see the raw JSON response.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-xl overflow-hidden shadow-2xl">
      {/* Console Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surfaceLight border-b border-border">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isError ? 'bg-error animate-pulse' : 'bg-primary'}`}></div>
          <span className="text-xs font-mono text-zinc-400">Response Body</span>
        </div>
        <button 
          onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}
          className="p-1.5 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-white"
          title="Copy to Clipboard"
        >
          <Copy size={14} />
        </button>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 overflow-auto p-4 bg-[#0d0d0d] custom-scrollbar">
        <SyntaxHighlight json={data} />
      </div>

      {/* Info/Debug Panel */}
      <div className="border-t border-border bg-surfaceLight p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Status</span>
            <div className={`flex items-center gap-1.5 font-mono text-sm ${isError ? 'text-error' : 'text-primary'}`}>
              {isError ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
              {meta.status} {isError ? 'Error' : 'OK'}
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
             <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Latency</span>
             <div className="flex items-center gap-1.5 font-mono text-sm text-zinc-300">
               <Clock size={14} className="text-zinc-500" />
               {meta.latency}ms
             </div>
          </div>

          <div className="flex flex-col gap-1">
             <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Size</span>
             <div className="flex items-center gap-1.5 font-mono text-sm text-zinc-300">
               <Database size={14} className="text-zinc-500" />
               {JSON.stringify(data).length} B
             </div>
          </div>

          <div className="flex flex-col gap-1">
             <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Timestamp</span>
             <div className="font-mono text-xs text-zinc-400 mt-0.5">
               {meta.timestamp}
             </div>
          </div>
        </div>

        {/* Extended Error Info */}
        {isError && (
          <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg">
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
  );
};