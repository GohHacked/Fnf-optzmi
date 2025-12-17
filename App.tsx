import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import OptimizationControls from './components/OptimizationControls';
import InfoModal from './components/InfoModal';
import { AdminLoginModal, AdminPanelModal } from './components/AdminModals';
import MaintenanceScreen from './components/MaintenanceScreen';
import { OptimizationConfig, OptimizedResult, Language } from './types';
import { optimizeAsset, formatBytes } from './utils/optimization';
import { translations } from './utils/translations';
import { db } from './utils/storage'; // Import DB service

// --- CONFIGURATION ---
const APP_VERSION = "1.3.2";

// --- Visual Components ---

const Snowfall = () => {
  const [flakes] = useState(() => 
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 5 + 5}s`,
      animationDelay: `-${Math.random() * 5}s`,
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
      <circle cx="180" cy="110" r="14" fill="white" className="drop-shadow-sm" />
      <path d="M20 135 Q 50 10 140 135 Z" fill="url(#hatGradient)" />
      <path d="M140 135 Q 160 160 180 110" fill="none" stroke="#DC2626" strokeWidth="28" strokeLinecap="round" />
      <path d="M10 135 Q 80 155 150 135" stroke="white" strokeWidth="24" strokeLinecap="round" />
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
  // --- STATE ---
  const [lang, setLang] = useState<Language>(() => {
    if (typeof navigator !== 'undefined' && navigator.language.startsWith('ru')) {
      return 'ru';
    }
    return 'en';
  });

  // Data
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedXml, setSelectedXml] = useState<File | null>(null);
  const [result, setResult] = useState<OptimizedResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI Modals
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Admin / Maintenance System (Using db.ts)
  const [isAdmin, setIsAdmin] = useState(db.isAdmin());
  const [maintenanceMode, setMaintenanceMode] = useState(db.getMaintenanceStatus());

  // Listen for storage changes (to sync across tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAdmin(db.isAdmin());
      setMaintenanceMode(db.getMaintenanceStatus());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update DB when state changes in this component
  const handleMaintenanceToggle = (val: boolean) => {
    db.setMaintenanceStatus(val);
    setMaintenanceMode(val);
  };

  const handleLogout = () => {
    db.logout();
    setIsAdmin(false);
    setIsAdminPanelOpen(false);
  };

  const handleLoginSuccess = () => {
    db.login();
    setIsAdmin(true);
    setIsAdminPanelOpen(true);
  };


  const [config, setConfig] = useState<OptimizationConfig>({
    scale: 0.8,
    quality: 0.8,
    format: 'image/png',
    mode: 'background',
    removeBlack: false
  });

  const t = translations[lang];

  // --- HANDLERS ---

  const handleOptimize = async () => {
    if (!selectedFile) return;
    if (config.mode === 'character' && !selectedXml) {
      setError(t.errorXmlMissing);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const res = await optimizeAsset(selectedFile, selectedXml, config);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError('Optimization failed. File might be corrupt or too large.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedXml(null);
    setResult(null);
    setError(null);
  };

  const toggleLang = () => setLang(l => l === 'en' ? 'ru' : 'en');

  // --- RENDER BLOCKERS ---

  if (maintenanceMode && !isAdmin) {
    return (
      <>
        <MaintenanceScreen 
          t={t} 
          onAdminLoginClick={() => setIsLoginOpen(true)}
        />
        <AdminLoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          t={t}
        />
      </>
    );
  }

  // --- MAIN RENDER ---

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center p-4 md:p-8 relative overflow-x-hidden font-rubik" onClick={() => isMenuOpen && setIsMenuOpen(false)}>
      
      {/* Maintenance Banner for Admin */}
      {isAdmin && maintenanceMode && (
        <div className="fixed top-0 left-0 right-0 bg-red-900 border-b border-red-500 text-white text-center font-bold text-xs py-2 z-[100] shadow-lg animate-pulse flex justify-center items-center gap-2">
           <span>🚧</span>
           <span>MAINTENANCE MODE ACTIVE (LOCAL SIMULATION)</span>
        </div>
      )}

      <div className="fixed inset-0 bg-gradient-to-b from-[#0a1025] via-[#1a0b2e] to-[#2b1020] pointer-events-none z-0" />
      <Snowfall />

      {/* Modals */}
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} t={t} />
      
      <AdminLoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        t={t}
      />

      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        maintenanceMode={maintenanceMode}
        setMaintenanceMode={handleMaintenanceToggle}
        onLogout={handleLogout}
        t={t}
      />
      
      {/* Navbar Buttons */}
      <div className="fixed top-8 right-4 z-50 flex gap-2">
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="bg-black/50 backdrop-blur border border-white/30 text-white w-10 h-10 rounded-full font-bold hover:bg-white/20 transition-colors flex items-center justify-center text-xl pb-2"
          >
            ...
          </button>
          
          {/* Dropdown Menu */}
          {isMenuOpen && (
             <div className="absolute right-0 mt-2 w-56 bg-gray-900 border-2 border-white/20 rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
               <button 
                 onClick={() => { setIsInfoOpen(true); setIsMenuOpen(false); }}
                 className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 text-white border-b border-white/10"
               >
                 ℹ️ {t.menuInfoTitle}
               </button>
               <button 
                 onClick={() => { /* Placeholder Update */ setIsMenuOpen(false); }}
                 className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 text-gray-400 border-b border-white/10"
               >
                 🔄 {t.menuUpdate} <span className="text-xs text-green-500 float-right opacity-50">Checking...</span>
               </button>
               <button 
                 onClick={() => {
                   setIsMenuOpen(false);
                   if (isAdmin) {
                     setIsAdminPanelOpen(true);
                   } else {
                     setIsLoginOpen(true);
                   }
                 }}
                 className="w-full text-left px-4 py-3 text-sm hover:bg-purple-900/50 text-purple-300 font-bold"
               >
                 💻 {t.menuAdmin}
               </button>
             </div>
          )}
        </div>

        <button 
          onClick={toggleLang}
          className="bg-black/50 backdrop-blur border border-white/30 text-white px-3 py-1 rounded-full font-bold hover:bg-white/20 transition-colors"
        >
          {lang === 'en' ? '🇷🇺 RU' : '🇺🇸 EN'}
        </button>
      </div>
      
      {/* Header */}
      <header className="relative z-10 text-center mb-8 mt-12 animate-float">
        <div className="relative inline-block">
          <SantaHat />
          <h1 className="font-funkin text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-white to-red-600 drop-shadow-[0_5px_5px_rgba(0,0,0,1)] stroke-white stroke-2 pb-2">
            FNF OPTIMIZER
          </h1>
        </div>
        
        <div className="flex justify-center items-center gap-3 mt-4">
          <span className="bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]">
            🎄 WINTER
          </span>
          <span className="bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]">
             v{APP_VERSION}
          </span>
          {isAdmin && (
            <span className="bg-purple-700 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-purple-400 animate-pulse">
             ADMIN
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-5xl">
        <div className="bg-black/60 backdrop-blur-xl border-4 border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(255,0,0,0.15)] relative overflow-hidden">
          
          <div className="absolute inset-0 border border-white/20 rounded-3xl pointer-events-none" />

          {error && (
            <div className="bg-red-900/80 border-2 border-red-500 text-white p-4 rounded-xl mb-6 font-bold text-center animate-pulse">
              🎅 {error}
            </div>
          )}

          {!selectedFile ? (
            <div className="space-y-6">
              <FileUpload 
                t={t}
                onFileSelect={(f) => {
                  setSelectedFile(f);
                  if(f.name.endsWith('.frag') || f.name.endsWith('.vert')) {
                    setConfig(p => ({...p, mode: 'shader'}));
                  } else if(f.name.includes('icon')) {
                    setConfig(p => ({...p, mode: 'icon'}));
                  } else if(f.name.endsWith('.zip') || f.name.endsWith('.rar')) {
                    setConfig(p => ({...p, mode: 'zip'}));
                  }
                }} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-gray-900/60 p-4 rounded-xl border border-white/10 hover:border-green-400 transition-colors group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎁</div>
                  <h4 className="font-bold text-green-400">{t.infoRam}</h4>
                  <p className="text-xs text-gray-400">{t.infoRamDesc}</p>
                </div>
                <div className="bg-gray-900/60 p-4 rounded-xl border border-white/10 hover:border-red-400 transition-colors group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🦌</div>
                  <h4 className="font-bold text-red-400">{t.infoSpeed}</h4>
                  <p className="text-xs text-gray-400">{t.infoSpeedDesc}</p>
                </div>
                <div className="bg-gray-900/60 p-4 rounded-xl border border-white/10 hover:border-yellow-400 transition-colors group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</div>
                  <h4 className="font-bold text-yellow-400">{t.modeZip}</h4>
                  <p className="text-xs text-gray-400">{t.menuZipSupport}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              <div className="space-y-6">
                 {/* ZIP ICON */}
                 {config.mode === 'zip' ? (
                   <div className="bg-gray-900/80 rounded-xl p-10 border-2 border-yellow-500 flex flex-col items-center justify-center h-64 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                      <span className="text-6xl mb-4">📦</span>
                      <span className="font-funkin text-2xl text-yellow-400">ARCHIVE LOADED</span>
                      <span className="font-mono text-xs text-gray-400 mt-2">{selectedFile.name}</span>
                   </div>
                 ) : config.mode === 'shader' ? (
                    <div className="bg-gray-900/80 rounded-xl p-4 h-64 overflow-auto font-mono text-xs text-green-400 border-2 border-gray-700">
                      SHADER FILE DETECTED
                      <br/>
                      {selectedFile.name}
                    </div>
                 ) : (
                   <div className="bg-gray-900/80 rounded-xl overflow-hidden border-2 border-gray-700 relative group shadow-inner">
                      <img 
                        src={URL.createObjectURL(selectedFile)} 
                        alt="Preview" 
                        className="w-full h-64 object-contain pattern-transparency"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 px-3 py-1 rounded-full text-xs font-mono text-white border border-gray-600">
                        {selectedFile.name}
                      </div>
                   </div>
                 )}

                 {config.mode === 'character' && (
                   <div className={`
                      border-2 border-dashed rounded-xl p-4 text-center transition-colors
                      ${selectedXml ? 'border-green-500 bg-green-900/20' : 'border-gray-600 hover:border-yellow-400'}
                   `}>
                     {!selectedXml ? (
                       <label className="cursor-pointer block w-full h-full">
                         <span className="text-3xl block mb-2">📜</span>
                         <span className="font-bold text-sm text-gray-300">{t.dropXml}</span>
                         <input type="file" accept=".xml" className="hidden" onChange={(e) => {
                           if(e.target.files?.[0]) setSelectedXml(e.target.files[0]);
                         }} />
                       </label>
                     ) : (
                       <div className="flex items-center justify-between">
                         <span className="font-mono text-sm text-green-300">✅ {selectedXml.name}</span>
                         <button onClick={() => setSelectedXml(null)} className="text-red-400 hover:text-red-300">×</button>
                       </div>
                     )}
                   </div>
                 )}
                 
                 <div className="bg-gray-800/80 rounded-xl p-4 border-l-4 border-red-500 backdrop-blur-sm flex justify-between items-center">
                    <div>
                      <h3 className="text-gray-400 text-xs uppercase font-bold">Original Size</h3>
                      <p className="text-white font-bold">{formatBytes(selectedFile.size + (selectedXml?.size || 0))}</p>
                    </div>
                    <button onClick={handleReset} className="text-xs text-gray-400 underline hover:text-white">
                      {t.reset}
                    </button>
                 </div>
              </div>

              <div>
                {!result ? (
                  <OptimizationControls 
                    config={config} 
                    lang={lang}
                    onChange={setConfig} 
                    onOptimize={handleOptimize}
                    isProcessing={isProcessing}
                    hasXml={!!selectedXml}
                  />
                ) : (
                  <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-green-500 rounded-xl p-6 text-center space-y-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <div>
                      <h2 className="font-funkin text-4xl text-green-400 mb-1 drop-shadow-md">{t.success}</h2>
                    </div>

                    <div className="flex justify-center items-end gap-4 font-mono">
                      <div className="text-gray-500 line-through text-sm mb-1">{formatBytes(result.originalSize)}</div>
                      <div className="text-white text-3xl">→</div>
                      <div className="text-green-400 text-2xl font-bold">{formatBytes(result.optimizedSize)}</div>
                    </div>

                    {result.width && (
                      <div className="bg-black/50 rounded p-2 text-xs text-gray-400 font-mono border border-white/5">
                        {result.width}x{result.height}
                      </div>
                    )}
                    
                    {result.isZip ? (
                       <a
                        href={result.url}
                        download={`OPTIMIZED_${selectedFile.name}`}
                        className="block w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-4 rounded-lg uppercase tracking-wider transition-all shadow-lg hover:shadow-orange-500/20"
                      >
                        {t.downloadZip}
                      </a>
                    ) : (
                      <>
                        <a
                          href={result.url}
                          download={`OPT_${selectedFile.name}`}
                          className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 rounded-lg uppercase tracking-wider transition-all shadow-lg hover:shadow-green-500/20"
                        >
                          {t.downloadImg}
                        </a>

                        {result.xmlUrl && (
                          <a
                            href={result.xmlUrl}
                            download={`OPT_${selectedXml?.name || 'character.xml'}`}
                            className="block w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded-lg uppercase tracking-wider transition-all shadow-lg"
                          >
                            {t.downloadXml}
                          </a>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => setResult(null)}
                      className="text-sm text-gray-500 hover:text-white"
                    >
                      {t.reset}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 mt-12 text-center text-gray-400 text-sm font-mono">
        <p>Psych Engine & Android Optimization Tool</p>
        <p className="opacity-50 text-xs mt-1">v{APP_VERSION} - ZIP SUPPORT</p>
      </footer>

      <style>{`
        .pattern-transparency {
          background-image: linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          background-color: #111827;
        }
        .bg-stripes-red {
          background-image: linear-gradient(45deg, #991b1b 25%, #7f1d1d 25%, #7f1d1d 50%, #991b1b 50%, #991b1b 75%, #7f1d1d 75%, #7f1d1d 100%);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
};

export default App;