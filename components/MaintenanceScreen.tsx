import React from 'react';
import { Translation } from '../types';

interface MaintenanceScreenProps {
  t: Translation;
  onAdminLoginClick: () => void;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ t, onAdminLoginClick }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center p-6 text-center font-rubik">
      
      {/* Abstract Background - Clean Gradients only, no SVG filters */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-black to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 max-w-2xl w-full">
        
        {/* Animated Lock Icon */}
        <div className="mb-8 relative inline-block">
           <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse" />
           <div className="text-8xl md:text-9xl relative z-10 animate-bounce">
             🔒
           </div>
        </div>
        
        <h1 className="font-funkin text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-800 mb-6 drop-shadow-md tracking-widest uppercase">
          {t.maintenanceScreenTitle}
        </h1>
        
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 backdrop-blur-sm">
          <p className="text-gray-300 text-lg md:text-xl font-mono leading-relaxed">
            {t.maintenanceScreenDesc}
          </p>
        </div>

        {/* Status Dots */}
        <div className="flex justify-center gap-3 mt-8">
            <div className="h-3 w-3 bg-red-600 rounded-full animate-ping" />
            <div className="h-3 w-3 bg-red-600 rounded-full animate-ping delay-150" />
            <div className="h-3 w-3 bg-red-600 rounded-full animate-ping delay-300" />
        </div>
      </div>

      <button 
        onClick={onAdminLoginClick}
        className="absolute bottom-6 right-6 text-gray-700 hover:text-red-500 font-mono text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
      >
        <span className="opacity-50">{t.adminAccess}</span> 💻
      </button>
    </div>
  );
};

export default MaintenanceScreen;