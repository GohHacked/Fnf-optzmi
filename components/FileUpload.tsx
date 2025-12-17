import React, { useRef, useState } from 'react';
import { Translation } from '../types';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  t: Translation;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, t }) => {
  const spriteInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  
  // States for drag hover effects
  const [spriteHover, setSpriteHover] = useState(false);
  const [zipHover, setZipHover] = useState(false);

  const handleDragOver = (e: React.DragEvent, type: 'sprite' | 'zip') => {
    e.preventDefault();
    if (type === 'sprite') setSpriteHover(true);
    else setZipHover(true);
  };

  const handleDragLeave = (e: React.DragEvent, type: 'sprite' | 'zip') => {
    e.preventDefault();
    if (type === 'sprite') setSpriteHover(false);
    else setZipHover(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'sprite' | 'zip') => {
    e.preventDefault();
    setSpriteHover(false);
    setZipHover(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
      {/* 1. BUTTON: SPRITE / SINGLE FILE */}
      <div
        onClick={() => spriteInputRef.current?.click()}
        onDragOver={(e) => handleDragOver(e, 'sprite')}
        onDragLeave={(e) => handleDragLeave(e, 'sprite')}
        onDrop={(e) => handleDrop(e, 'sprite')}
        className={`
          relative cursor-pointer group
          border-4 border-dashed rounded-2xl p-8 text-center transition-all duration-300
          flex flex-col items-center justify-center h-48
          ${spriteHover 
            ? 'border-cyan-400 bg-cyan-900/40 scale-105' 
            : 'border-gray-700 bg-gray-900/50 hover:border-cyan-500 hover:bg-gray-800'
          }
        `}
      >
        <input
          type="file"
          ref={spriteInputRef}
          onChange={handleChange}
          accept="image/*,.xml,.json,.frag,.vert"
          className="hidden"
        />
        <div className="text-5xl mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
          🖼️
        </div>
        <h3 className="font-funkin text-2xl text-white drop-shadow-md uppercase tracking-wider">
          {t.uploadSpriteBtn}
        </h3>
        <p className="text-cyan-400 font-bold text-xs mt-2 font-mono">
          {t.uploadSpriteDesc}
        </p>
      </div>

      {/* 2. BUTTON: ZIP ARCHIVE */}
      <div
        onClick={() => zipInputRef.current?.click()}
        onDragOver={(e) => handleDragOver(e, 'zip')}
        onDragLeave={(e) => handleDragLeave(e, 'zip')}
        onDrop={(e) => handleDrop(e, 'zip')}
        className={`
          relative cursor-pointer group
          border-4 border-dashed rounded-2xl p-8 text-center transition-all duration-300
          flex flex-col items-center justify-center h-48
          ${zipHover 
            ? 'border-yellow-400 bg-yellow-900/40 scale-105' 
            : 'border-gray-700 bg-gray-900/50 hover:border-yellow-500 hover:bg-gray-800'
          }
        `}
      >
        <input
          type="file"
          ref={zipInputRef}
          onChange={handleChange}
          accept=".zip,.rar"
          className="hidden"
        />
        <div className="text-5xl mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
          📦
        </div>
        <h3 className="font-funkin text-2xl text-white drop-shadow-md uppercase tracking-wider">
          {t.uploadZipBtn}
        </h3>
        <p className="text-yellow-400 font-bold text-xs mt-2 font-mono">
          {t.uploadZipDesc}
        </p>
      </div>
    </div>
  );
};

export default FileUpload;