import React from 'react';
import { OptimizationConfig } from '../types';

interface ControlsProps {
  config: OptimizationConfig;
  onChange: (config: OptimizationConfig) => void;
  onOptimize: () => void;
  isProcessing: boolean;
}

const OptimizationControls: React.FC<ControlsProps> = ({ config, onChange, onOptimize, isProcessing }) => {
  
  const updateConfig = (key: keyof OptimizationConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="bg-gray-900 border-4 border-gray-800 rounded-xl p-6 shadow-2xl space-y-6">
      <div className="space-y-2">
        <label className="block text-cyan-400 font-bold uppercase tracking-wider">
          Scale (Resize)
        </label>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Low RAM (0.5x)</span>
          <span>Original (1.0x)</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          value={config.scale}
          onChange={(e) => updateConfig('scale', parseFloat(e.target.value))}
          className="w-full h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
        />
        <div className="text-right text-white font-mono">{Math.round(config.scale * 100)}%</div>
      </div>

      <div className="space-y-2">
        <label className="block text-pink-500 font-bold uppercase tracking-wider">
          Compression Quality
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
        <label className="block text-yellow-400 font-bold uppercase tracking-wider">
          Output Format
        </label>
        <select
          value={config.format}
          onChange={(e) => updateConfig('format', e.target.value)}
          className="w-full bg-gray-800 text-white border-2 border-gray-600 rounded-lg p-3 focus:outline-none focus:border-yellow-400 font-bold"
        >
          <option value="image/png">PNG (Best for Sprites)</option>
          <option value="image/jpeg">JPG (Smallest Size)</option>
          <option value="image/webp">WebP (Modern Android)</option>
        </select>
      </div>

      <button
        onClick={onOptimize}
        disabled={isProcessing}
        className={`
          w-full py-4 rounded-xl text-2xl font-funkin uppercase tracking-widest transition-all transform
          ${isProcessing 
            ? 'bg-gray-600 cursor-not-allowed opacity-50' 
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95'
          }
        `}
      >
        {isProcessing ? 'Optimizing...' : 'Start Optimization'}
      </button>
    </div>
  );
};

export default OptimizationControls;