import React from 'react';
import { Translation } from '../types';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: Translation;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-gray-900 border-2 border-white/20 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900 to-blue-900 p-4 flex justify-between items-center border-b border-white/10">
          <h2 className="font-funkin text-2xl text-white tracking-widest">{t.menuInfoTitle}</h2>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto scrollbar-thin text-left space-y-6">
          
          <section>
            <h3 className="text-cyan-400 font-bold text-lg mb-2 flex items-center gap-2">
              <span>🚀</span> {t.menuWhyOptimize}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t.menuWhyOptimizeDesc}
            </p>
          </section>

          <section className="bg-white/5 rounded-xl p-4 border border-white/5">
            <h3 className="text-green-400 font-bold text-lg mb-3">
              {t.menuFeatures}
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>{t.menuFeat1}</li>
              <li>{t.menuFeat2}</li>
              <li>{t.menuFeat3}</li>
            </ul>
          </section>

          <section>
             <h3 className="text-yellow-400 font-bold text-lg mb-2 flex items-center gap-2">
              <span>📦</span> {t.menuZipSupport}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t.menuZipSupportDesc}
            </p>
          </section>

          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500">v1.2 - Psych Engine Web Tools</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InfoModal;