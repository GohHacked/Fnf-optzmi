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

  const renderSliders = () => {
    if (config.mode === 'shader') return null;

    return (
      <>
        {config.mode !== 'icon' && (
          <div className="space-y-2">
            <label className="block text-cyan-400 font-bold uppercase tracking-wider text-sm">
              {t.scale}
            </label>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0.5x</span>
              <span>1.0x</span>
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