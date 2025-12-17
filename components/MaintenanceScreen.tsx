import React from 'react';
import { Translation } from '../types';

interface MaintenanceScreenProps {
  t: Translation;
  onAdminLoginClick: () => void;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ t, onAdminLoginClick }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center font-rubik overflow-hidden selection:bg-red-500 selection:text-white">
      
      {/* CSS-based Noise/Glitch Background (No external images) */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-50 filter contrast-150">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
          </svg>
      </div>
      
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,6px_100%]" />

      <div className="relative z-10 bg-black/80 border-4 border-red-600 rounded-3xl p-8 max-w-2xl shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-pulse-slow backdrop-blur-sm">
        <div className="text-7xl mb-6 animate-bounce">
          🚧
        </div>
        
        <h1 className="font-funkin text-5xl md:text-6xl text-red-500 mb-4 stroke-white drop-shadow-lg tracking-wider">
          {t.maintenanceScreenTitle}
        </h1>
        
        <p className="text-gray-300 text-lg md:text-xl font-mono mb-8 border-y-2 border-red-900/50 py-4 uppercase tracking-widest">
          {t.maintenanceScreenDesc}
        </p>

        <div className="flex justify-center gap-4">
            <div className="h-3 w-3 bg-red-500 rounded-full animate-ping" />
            <div className="h-3 w-3 bg-red-500 rounded-full animate-ping delay-75" />
            <div className="h-3 w-3 bg-red-500 rounded-full animate-ping delay-150" />
        </div>
      </div>

      <button 
        onClick={onAdminLoginClick}
        className="absolute bottom-8 right-8 text-gray-600 hover:text-white font-mono text-xs opacity-50 hover:opacity-100 transition-all border border-transparent hover:border-gray-500 rounded px-2 py-1"
      >
        {t.adminAccess} 💻
      </button>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { box-shadow: 0 0 30px rgba(220,38,38,0.2); border-color: #7f1d1d; }
          50% { box-shadow: 0 0 60px rgba(220,38,38,0.5); border-color: #dc2626; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default MaintenanceScreen;