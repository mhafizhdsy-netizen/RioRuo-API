
import React, { useState, useEffect } from 'react';
import { Copy, AlertTriangle, CheckCircle, Clock, Database, Terminal, Download, Eye, X, Check, FileJson, Maximize2 } from 'lucide-react';

interface ConsoleOutputProps {
  data: any;
  loading: boolean;
  meta: {
    status: number;
    latency: number;
    timestamp: string;
  };
  onCopySuccess?: (message: string) => void; // Updated prop for generic copy success notification
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
    <div className="w-full h-[500px] bg-surface border border-border rounded-xl overflow-hidden shadow-2xl flex flex-col relative">
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-surfaceLight rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="flex flex-col items-center text-center">
          <p className="text-primary font-mono text-sm font-bold tracking-widest animate-pulse">FETCHING DATA</p>
          <p className="text-zinc-500 text-xs font-mono mt-2 transition-opacity duration-500" key={loadingMessage}>
            {loadingMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ data, loading, meta, onCopySuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const isError = meta.status >= 400 || (data && data.status === 'error');
  const containerClass = "w-full h-[500px] bg-surface border border-border rounded-xl overflow-hidden shadow-2xl flex flex-col relative";

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  const handleDownload = () => {
    if (!data) return;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rioruo-api-response-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    if (onCopySuccess) {
      onCopySuccess('Copied to clipboard!');
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!data) {
    return (
      <div className={`${containerClass} border-dashed`}>
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-surfaceLight rounded-full flex items-center justify-center mb-4">
            <Terminal size={32} className="text-zinc-600" />
          </div>
          <h3 className="text-zinc-300 font-bold mb-2">Ready to Fetch</h3>
          <p className="text-zinc-500 text-sm max-w-xs">Select an endpoint and fire a request to see the raw JSON response.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={containerClass}>
        {/* Console Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-surfaceLight border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isError ? 'bg-error animate-pulse' : 'bg-primary'}`}></div>
            <span className="text-xs font-mono text-zinc-400">Response Body</span>
          </div>
          <div className="flex items-center gap-1">
             <button 
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-white"
              title="Expand View"
            >
              <Maximize2 size={14} />
            </button>
            <button 
              onClick={handleDownload}
              className="p-1.5 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-white"
              title="Export as JSON"
            >
              <Download size={14} />
            </button>
            
            <button 
              onClick={handleCopy}
              className="p-1.5 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-white flex items-center justify-center"
              title="Copy to Clipboard"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        {/* Console Content */}
        <div className="flex-1 overflow-auto p-4 bg-[#0d0d0d] custom-scrollbar relative group">
          <SyntaxHighlight json={data} />
        </div>

        {/* Console Footer / Metadata */}
        <div className="border-t border-border bg-surfaceLight p-4 shrink-0">
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

          {isError && (
            <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg animate-in slide-in-from-bottom-2">
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

      {/* Redesigned Raw Response Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-7xl h-[85vh] bg-[#0e0e10] border border-border rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             
             {/* Modal Header */}
             <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-border shrink-0">
               <div className="flex items-center gap-4">
                 <div className="p-2 bg-primary/10 rounded-lg">
                    <FileJson size={20} className="text-primary" />
                 </div>
                 <div>
                    <h3 className="font-bold text-white text-base tracking-tight">Raw JSON Inspector</h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${isError ? 'bg-error/10 text-error border-error/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                            Status: {meta.status}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                            <Database size={10} /> {JSON.stringify(data).length} bytes
                        </span>
                    </div>
                 </div>
               </div>
               
               <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
             </div>

             {/* Modal Toolbar */}
             <div className="px-6 py-2 bg-surfaceLight border-b border-border flex items-center justify-between shrink-0">
                <div className="text-xs text-zinc-500 font-mono">
                    formatted_response.json
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleCopy}
                        className={`flex items-center justify-center w-8 h-8 rounded-md text-xs font-medium transition-all bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10
                        `}
                        title="Copy JSON"
                    >
                        <Copy size={14} />
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs font-medium text-zinc-300 transition-colors"
                    >
                        <Download size={14} /> Download
                    </button>
                </div>
             </div>

             {/* Modal Content */}
             <div className="flex-1 overflow-auto bg-[#050505] custom-scrollbar p-6">
               <div className="max-w-full">
                  <SyntaxHighlight json={data} />
               </div>
             </div>

             {/* Modal Footer Hint */}
             <div className="px-6 py-2 bg-surface border-t border-border text-[10px] text-zinc-600 font-mono text-right">
                Press ESC to close
             </div>
          </div>
        </div>
      )}
    </>
  );
};
