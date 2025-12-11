import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import OptimizationControls from './components/OptimizationControls';
import { OptimizationConfig, OptimizedResult } from './types';
import { optimizeImage, formatBytes } from './utils/optimization';

// --- Visual Components ---

const Snowfall = () => {
  // Generate static set of snowflakes to prevent re-renders causing jitter
  const [flakes] = useState(() => 
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 5 + 5}s`, // Slower, more peaceful snow
      animationDelay: `-${Math.random() * 5}s`, // Start immediately at different positions
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.3
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {flakes.map(flake => (
        <div 
          key={flake.id}
          className="absolute bg-white rounded-full shadow-[0_0_4px_white]"
          style={{
            left: flake.left,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            top: '-20px',
            animation: `snowfall ${flake.animationDuration} linear infinite`,
            animationDelay: flake.animationDelay
          }}
        />
      ))}
      <style>{`
        @keyframes snowfall {
          0% { transform: translateY(-10vh) translateX(-10px); }
          100% { transform: translateY(110vh) translateX(20px); }
        }
      `}</style>
    </div>
  );
};

const SantaHat = () => (
  <div className="absolute -top-12 -left-6 md:-top-16 md:-left-8 w-24 h-24 md:w-32 md:h-32 pointer-events-none z-20 filter drop-shadow-xl transform -rotate-12 hover:rotate-0 transition-transform duration-300">
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Fluffy Ball */}
      <circle cx="180" cy="110" r="14" fill="white" className="drop-shadow-sm" />
      
      {/* Main Red Hat Body */}
      <path 
        d="M20 135 Q 50 10 140 135 Z" 
        fill="url(#hatGradient)" 
      />
      {/* The flop over */}
      <path 
        d="M140 135 Q 160 160 180 110" 
        fill="none" 
        stroke="#DC2626" 
        strokeWidth="28" 
        strokeLinecap="round" 
      />
      
      {/* White Fur Trim */}
      <path 
        d="M10 135 Q 80 155 150 135" 
        stroke="white" 
        strokeWidth="24" 
        strokeLinecap="round" 
      />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="hatGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// --- Main App ---

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<OptimizedResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [config, setConfig] = useState<OptimizationConfig>({
    scale: 0.8,
    quality: 0.8,
    format: 'image/png'
  });

  const handleOptimize = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const res = await optimizeImage(selectedFile, config);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError('Optimization failed. Please try a different file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center p-4 md:p-8 relative overflow-x-hidden font-rubik">
      {/* Festive Background Layers */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a1025] via-[#1a0b2e] to-[#2b1020] pointer-events-none z-0" />
      <Snowfall />
      
      {/* Header */}
      <header className="relative z-10 text-center mb-10 mt-8 animate-float">
        <div className="relative inline-block">
          <SantaHat />
          <h1 className="font-funkin text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-white to-red-600 drop-shadow-[0_5px_5px_rgba(0,0,0,1)] stroke-white stroke-2 pb-2">
            FNF OPTIMIZATION
          </h1>
        </div>
        
        <div className="flex justify-center items-center gap-3 mt-4">
          <span className="bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]">
            🎄 HOLIDAY EDITION
          </span>
          <span className="bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]">
             v1.1 WINTER
          </span>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="relative z-10 w-full max-w-4xl">
        <div className="bg-black/60 backdrop-blur-xl border-4 border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(255,0,0,0.15)] relative overflow-hidden">
          
          {/* Subtle Frost Border Effect */}
          <div className="absolute inset-0 border border-white/20 rounded-3xl pointer-events-none" />

          {error && (
            <div className="bg-red-900/80 border-2 border-red-500 text-white p-4 rounded-xl mb-6 font-bold text-center animate-pulse">
              🎅 {error}
            </div>
          )}

          {!selectedFile ? (
            <div className="space-y-6">
              <FileUpload onFileSelect={setSelectedFile} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-gray-900/60 p-4 rounded-xl border border-white/10 hover:border-green-400 transition-colors group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎁</div>
                  <h4 className="font-bold text-green-400">Lightweight</h4>
                  <p className="text-xs text-gray-400">Gift wrapped for Android</p>
                </div>
                <div className="bg-gray-900/60 p-4 rounded-xl border border-white/10 hover:border-red-400 transition-colors group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🦌</div>
                  <h4 className="font-bold text-red-400">Swift Speed</h4>
                  <p className="text-xs text-gray-400">Faster than reindeer</p>
                </div>
                <div className="bg-gray-900/60 p-4 rounded-xl border border-white/10 hover:border-yellow-400 transition-colors group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⭐</div>
                  <h4 className="font-bold text-yellow-400">Psych Ready</h4>
                  <p className="text-xs text-gray-400">Star of the show</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              {/* Left Column: Preview & Stats */}
              <div className="space-y-6">
                 <div className="bg-gray-900/80 rounded-xl overflow-hidden border-2 border-gray-700 relative group shadow-inner">
                    <img 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Preview" 
                      className="w-full h-64 object-contain pattern-transparency"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 px-3 py-1 rounded-full text-xs font-mono text-white border border-gray-600">
                      Original
                    </div>
                 </div>
                 
                 <div className="bg-gray-800/80 rounded-xl p-4 border-l-4 border-red-500 backdrop-blur-sm">
                    <h3 className="text-gray-400 text-sm uppercase font-bold">File Info</h3>
                    <p className="text-white text-lg font-mono truncate">{selectedFile.name}</p>
                    <p className="text-red-400 font-bold">{formatBytes(selectedFile.size)}</p>
                 </div>

                 <button 
                  onClick={handleReset}
                  className="w-full text-gray-400 hover:text-white underline text-sm py-2"
                 >
                   Select Different Sprite
                 </button>
              </div>

              {/* Right Column: Controls or Result */}
              <div>
                {!result ? (
                  <OptimizationControls 
                    config={config} 
                    onChange={setConfig} 
                    onOptimize={handleOptimize}
                    isProcessing={isProcessing}
                  />
                ) : (
                  <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-green-500 rounded-xl p-6 text-center space-y-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <div>
                      <h2 className="font-funkin text-4xl text-green-400 mb-1 drop-shadow-md">NICE!</h2>
                      <p className="text-gray-400 text-sm">Optimization Complete</p>
                    </div>

                    <div className="flex justify-center items-end gap-4 font-mono">
                      <div className="text-gray-500 line-through text-sm mb-1">{formatBytes(result.originalSize)}</div>
                      <div className="text-white text-3xl">→</div>
                      <div className="text-green-400 text-2xl font-bold">{formatBytes(result.optimizedSize)}</div>
                    </div>

                    <div className="bg-black/50 rounded p-2 text-xs text-gray-400 font-mono border border-white/5">
                      Resolution: {result.width}x{result.height}
                    </div>

                    <div className="text-sm text-green-300 font-bold">
                      Saved {formatBytes(result.originalSize - result.optimizedSize)}!
                    </div>

                    <a
                      href={result.url}
                      download={`OPT_${selectedFile.name}`}
                      className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 rounded-lg uppercase tracking-wider transition-all shadow-lg hover:shadow-green-500/20"
                    >
                      Download Sprite
                    </a>

                    <button
                      onClick={() => setResult(null)}
                      className="text-sm text-gray-500 hover:text-white"
                    >
                      Optimize Another
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 text-center text-gray-400 text-sm font-mono">
        <p>Created for Psych Engine & Android Porting</p>
        <p className="opacity-50 text-xs mt-1">Happy Holidays from the Dev Team! ❄️</p>
      </footer>

      <style>{`
        .pattern-transparency {
          background-image: linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          background-color: #111827;
        }
      `}</style>
    </div>
  );
};

export default App;