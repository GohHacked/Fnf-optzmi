import React from 'react';
import { Translation } from '../types';

interface UpdateModalProps {
  onClose: () => void;
  t: Translation;
  version: string;
  isRemoteUpdate?: boolean; // If true, it means a NEW version is available on server
  remoteVersion?: string;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ onClose, t, version, isRemoteUpdate, remoteVersion }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`relative bg-gradient-to-br ${isRemoteUpdate ? 'from-green-900 to-emerald-900 border-green-400' : 'from-indigo-900 to-purple-900 border-cyan-400'} border-2 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden`}>
        
        <div className="p-6 text-center space-y-4">
          <div className="text-5xl animate-bounce">
            {isRemoteUpdate ? '🚀' : '🎁'}
          </div>
          
          <h2 className="font-funkin text-4xl text-white drop-shadow-md">
            {isRemoteUpdate ? t.newVersionTitle : t.updateTitle}
          </h2>
          
          <p className={`${isRemoteUpdate ? 'text-green-200' : 'text-cyan-200'} font-mono text-sm tracking-widest uppercase`}>
            {isRemoteUpdate ? `New: v${remoteVersion} | Current: v${version}` : `Version ${version}`}
          </p>
          
          {isRemoteUpdate ? (
            <div className="bg-black/30 rounded-xl p-4 text-center text-gray-200 text-sm border border-white/10">
              <p>{t.newVersionDesc}</p>
            </div>
          ) : (
            <div className="bg-black/30 rounded-xl p-4 text-left text-gray-200 text-sm space-y-2 border border-white/10">
              <p>✅ <b>Update Fix</b>: Fixed the update window appearing after reload.</p>
              <p>✅ <b>Bug Fixes</b>: Improved stability.</p>
              <p>✅ <b>ZIP Upload</b>: Works faster now.</p>
              <p>✅ <b>GitHub Sync</b>: Better detection.</p>
            </div>
          )}

          <button 
            onClick={() => {
              if (isRemoteUpdate) {
                window.location.reload();
              } else {
                onClose();
              }
            }}
            className={`w-full ${isRemoteUpdate ? 'bg-green-500 hover:bg-green-400' : 'bg-cyan-500 hover:bg-cyan-400'} text-white font-bold py-3 rounded-xl uppercase tracking-widest shadow-lg transition-transform hover:scale-105 active:scale-95`}
          >
            {isRemoteUpdate ? t.reloadBtn : t.updateBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;