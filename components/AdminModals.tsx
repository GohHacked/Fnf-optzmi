import React, { useState } from 'react';
import { Translation } from '../types';

// --- LOGIN MODAL ---

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  t: Translation;
}

export const AdminLoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess, t }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'goh@gmail.com' && password === 'q1') {
      onLoginSuccess();
      setError(false);
      setEmail('');
      setPassword('');
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border-2 border-cyan-500 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
        
        <h2 className="font-funkin text-3xl text-cyan-400 text-center mb-6 tracking-widest">
          {t.loginTitle}
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t.passPlaceholder}
              className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center font-bold">ACCESS DENIED / WRONG CREDENTIALS</p>}

          <button 
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg uppercase tracking-wider transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]"
          >
            {t.btnLogin}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- ADMIN PANEL MODAL ---

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceMode: boolean;
  setMaintenanceMode: (val: boolean) => void;
  onLogout: () => void;
  t: Translation;
}

export const AdminPanelModal: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  maintenanceMode, 
  setMaintenanceMode, 
  onLogout,
  t 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-gray-900 border-4 border-purple-500 rounded-2xl w-full max-w-md p-6 shadow-[0_0_40px_rgba(168,85,247,0.3)] relative">
         <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>

         <div className="text-center mb-6">
            <div className="text-5xl mb-2">💻</div>
            <h2 className="font-funkin text-3xl text-purple-400 tracking-widest">{t.adminPanelTitle}</h2>
            <p className="text-xs text-gray-500 font-mono">user: goh@gmail.com</p>
         </div>

         {/* Warning about Local Storage */}
         <div className="bg-yellow-900/30 border border-yellow-600/50 p-3 rounded-lg mb-4 text-left">
           <p className="text-yellow-200 text-xs font-mono flex gap-2">
             <span>⚠️</span>
             <b>LOCAL DATABASE:</b> Settings are saved to this browser only. Enabling Maintenance Mode here will NOT affect other devices unless you connect a backend.
           </p>
         </div>

         <div className="bg-black/40 rounded-xl p-6 border border-white/10 mb-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              🔧 {t.maintenanceMode}
            </h3>
            
            <div className="flex items-center justify-between mb-4">
               <span className={`text-sm font-bold ${maintenanceMode ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                 {maintenanceMode ? t.maintenanceOn : t.maintenanceOff}
               </span>
               
               <button 
                 onClick={() => setMaintenanceMode(!maintenanceMode)}
                 className={`w-14 h-8 rounded-full transition-colors relative ${maintenanceMode ? 'bg-red-500' : 'bg-gray-600'}`}
               >
                 <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform shadow-md ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
               </button>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              {t.maintenanceDesc}
            </p>
         </div>

         <button 
           onClick={() => {
             onLogout();
             onClose();
           }}
           className="w-full border-2 border-red-500 text-red-500 hover:bg-red-500/10 font-bold py-3 rounded-lg uppercase tracking-wider transition-all"
         >
           {t.logout}
         </button>
      </div>
    </div>
  );
};