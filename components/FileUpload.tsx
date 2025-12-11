import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/'))) {
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
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative overflow-hidden cursor-pointer group
        border-4 border-dashed rounded-xl p-10 text-center transition-all duration-300
        ${isDragging 
          ? 'border-cyan-400 bg-cyan-900/30 scale-105' 
          : 'border-gray-700 hover:border-pink-500 hover:bg-gray-800'
        }
      `}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept="image/png, image/jpeg"
        className="hidden"
      />
      
      <div className="pointer-events-none relative z-10">
        <div className={`text-6xl mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
          📂
        </div>
        <h3 className="font-funkin text-3xl mb-2 text-white drop-shadow-lg">
          DROP SPRITE HERE
        </h3>
        <p className="text-gray-400 font-bold">
          PNG or JPG files supported
        </p>
      </div>

      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default FileUpload;