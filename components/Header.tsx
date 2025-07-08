import React, { memo } from 'react';
import { LogoIcon, SettingsIcon, DownloadIcon } from './Icons';
import { HeaderUsageIndicator } from './HeaderUsageIndicator';
import { downloadChromeExtension, isWebApp } from '../services/downloadService';

interface HeaderProps {
  onSettingsClick: () => void;
  refreshTrigger?: number;
}

export const Header: React.FC<HeaderProps> = memo(({ onSettingsClick, refreshTrigger }) => {
  const showDownloadButton = isWebApp();

  const handleDownloadExtension = () => {
    downloadChromeExtension();
  };

  return (
    <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="flex items-center gap-3">
        <LogoIcon />
        <div className="text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Prompt Optimizer
          </h1>
          <p className="mt-1 text-sm text-slate-400 hidden sm:block">
            Transform your ideas into exceptional AI prompts.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {showDownloadButton && (
          <div className="flex items-center gap-2 animate-bounce">
            <button 
              onClick={handleDownloadExtension}
              className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-lg hover:from-purple-500 hover:to-indigo-500 transition-transform transform hover:scale-105"
              aria-label="Download Chrome Extension"
              title="Download Chrome Extension"
            >
              <span className="inline-block w-5 h-5 mr-2">
                <DownloadIcon />
              </span>
              Get the Chrome Extension
            </button>
          </div>
        )}
        <HeaderUsageIndicator refreshTrigger={refreshTrigger} onOpenSettings={onSettingsClick} />
        <button 
          onClick={onSettingsClick}
          className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
          aria-label="Settings"
        >
          <SettingsIcon />
        </button>
      </div>
    </header>
  );
});
