import React from 'react';
import { Translation } from '../types';

interface MaintenanceScreenProps {
  t: Translation;
  onAdminLoginClick: () => void;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ t, onAdminLoginClick }) => {
  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center p-6 text-center font-rubik overflow-hidden">
      
      {/* Background Glitch Effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] bg-cover mix-blend-screen" />
      
      <div className="relative z-10 bg-gray-900/90 border-4 border-red-600 rounded-3xl p-8 max-w-2xl shadow-[0_0_100px_rgba(220,38,38,0.5)] animate-pulse-slow">
        <div className="text-7xl mb-6 animate-bounce">
          🚧
        </div>
        
        <h1 className="font-funkin text-5xl md:text-6xl text-red-500 mb-4 stroke-white drop-shadow-lg tracking-wider">
          {t.maintenanceScreenTitle}
        </h1>
        
        <p className="text-gray-300 text-lg md:text-xl font-mono mb-8 border-y-2 border-red-900/50 py-4">
          {t.maintenanceScreenDesc}
        </p>

        <div className="flex justify-center gap-4">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-ping" />
            <div className="h-2 w-2 bg-red-500 rounded-full animate-ping delay-75" />
            <div className="h-2 w-2 bg-red-500 rounded-full animate-ping delay-150" />
        </div>
      </div>

      <button 
        onClick={onAdminLoginClick}
        className="absolute bottom-8 right-8 text-gray-700 hover:text-gray-500 font-mono text-xs opacity-50 hover:opacity-100 transition-all"
      >
        {t.adminAccess} 💻
      </button>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { box-shadow: 0 0 50px rgba(220,38,38,0.3); border-color: #991b1b; }
          50% { box-shadow: 0 0 100px rgba(220,38,38,0.6); border-color: #dc2626; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite;
        }
      `}</style>
    </div>
  );
};

export default MaintenanceScreen;