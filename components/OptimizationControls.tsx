import React from 'react';
import { OptimizationConfig, AssetMode, Language } from '../types';
import { translations } from '../utils/translations';

interface ControlsProps {
  config: OptimizationConfig;
  lang: Language;
  onChange: (config: OptimizationConfig) => void;
  onOptimize: () => void;
  isProcessing: boolean;
  hasXml: boolean;
}

const OptimizationControls: React.FC<ControlsProps> = ({ 
  config, 
  lang,
  onChange, 
  onOptimize, 
  isProcessing,
  hasXml
}) => {
  
  const t = translations[lang];

  const updateConfig = (key: keyof OptimizationConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const applyPreset = (scale: number, quality: number) => {
    onChange({ ...config, scale, quality });
  };

  const renderSliders = () => {
    if (config.mode === 'shader') return null;

    return (
      <>
        {config.mode !== 'icon' && config.mode !== 'zip' && (
          <div className="space-y-4">
             {/* PRESETS */}
             <div>
               <label className="block text-gray-400 font-bold text-xs uppercase mb-2">
                 {t.presetsTitle}
               </label>
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => applyPreset(1.0, 0.9)}
                   className="bg-green-900/40 border border-green-600 text-green-300 text-xs font-bold py-2 rounded hover:bg-green-800/60 transition-colors"
                 >
                   {t.presetHigh}
                 </button>
                 <button 
                   onClick={() => applyPreset(0.75, 0.8)}
                   className="bg-blue-900/40 border border-blue-600 text-blue-300 text-xs font-bold py-2 rounded hover:bg-blue-800/60 transition-colors"
                 >
                   {t.presetBalanced}
                 </button>
                 <button 
                   onClick={() => applyPreset(0.5, 0.7)}
                   className="bg-yellow-900/40 border border-yellow-600 text-yellow-300 text-xs font-bold py-2 rounded hover:bg-yellow-800/60 transition-colors"
                 >
                   {t.presetPerf}
                 </button>
                 <button 
                   onClick={() => applyPreset(0.25, 0.6)}
                   className="bg-red-900/40 border border-red-600 text-red-300 text-xs font-bold py-2 rounded hover:bg-red-800/60 transition-colors"
                 >
                   {t.presetPotato}
                 </button>
               </div>
             </div>

            <label className="block text-cyan-400 font-bold uppercase tracking-wider text-sm mt-4">
              {t.scale}
            </label>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0.1x (Potato)</span>
              <span>1.0x (Original)</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={config.scale}
              onChange={(e) => updateConfig('scale', parseFloat(e.target.value))}
              className="w-full h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
            />
            <div className="text-right text-white font-mono">{Math.round(config.scale * 100)}%</div>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-pink-500 font-bold uppercase tracking-wider text-sm">
            {t.quality}
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={config.quality}
            onChange={(e) => updateConfig('quality', parseFloat(e.target.value))}
            className="w-full h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
          />
          <div className="text-right text-white font-mono">{Math.round(config.quality * 100)}%</div>
        </div>

        {/* Black Background Toggle */}
        <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700">
           <label className="text-white text-sm font-bold flex items-center gap-2">
             <span>🖌️</span> {t.removeBlack}
           </label>
           <button 
             onClick={() => updateConfig('removeBlack', !config.removeBlack)}
             className={`w-12 h-6 rounded-full transition-colors relative ${config.removeBlack ? 'bg-green-500' : 'bg-gray-600'}`}
           >
             <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${config.removeBlack ? 'translate-x-6' : 'translate-x-0'}`} />
           </button>
        </div>

        <div className="space-y-2">
          <label className="block text-yellow-400 font-bold uppercase tracking-wider text-sm">
            {t.format}
          </label>
          <select
            value={config.format}
            onChange={(e) => updateConfig('format', e.target.value)}
            className="w-full bg-gray-800 text-white border-2 border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-400 font-bold"
          >
            <option value="image/png">PNG (Psych Engine)</option>
            <option value="image/jpeg">JPG (Backgrounds)</option>
            <option value="image/webp">WebP (Android Light)</option>
          </select>
        </div>
      </>
    );
  };

  return (
    <div className="bg-gray-900 border-4 border-gray-800 rounded-xl p-6 shadow-2xl space-y-6">
      
      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { id: 'character', label: t.modeChar, icon: '🎤' },
          { id: 'background', label: t.modeBg, icon: '🖼️' },
          { id: 'icon', label: t.modeIcon, icon: '😐' },
          { id: 'shader', label: t.modeShader, icon: '🔮' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => updateConfig('mode', m.id)}
            className={`p-2 rounded-lg text-xs font-bold transition-all border-2 ${
              config.mode === m.id 
              ? 'bg-blue-600 border-white text-white scale-105' 
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span className="block text-lg">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {renderSliders()}

      {config.mode === 'shader' && (
        <div className="bg-gray-800 p-3 rounded border border-purple-500 text-purple-200 text-xs">
          {t.shaderFix}
        </div>
      )}

      {config.mode === 'character' && !hasXml && (
        <div className="bg-red-900/50 p-2 rounded text-red-200 text-xs border border-red-500">
          ⚠️ XML Required
        </div>
      )}

      <button
        onClick={onOptimize}
        disabled={isProcessing || (config.mode === 'character' && !hasXml)}
        className={`
          w-full py-4 rounded-xl text-xl font-funkin uppercase tracking-widest transition-all transform
          ${isProcessing || (config.mode === 'character' && !hasXml)
            ? 'bg-gray-600 cursor-not-allowed opacity-50' 
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95'
          }
        `}
      >
        {isProcessing ? t.btnOptimizing : t.btnOptimize}
      </button>
    </div>
  );
};

export default OptimizationControls;