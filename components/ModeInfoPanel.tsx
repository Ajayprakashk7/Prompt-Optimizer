import React, { useState, useRef, useEffect } from 'react';
import { InformationCircleIcon, XMarkIcon } from './Icons';
import { parseSimpleMarkdown } from '../utils/simpleMarkdown';
import type { SettingOption } from '../types/prompt';

interface ModeInfoPanelProps {
  modes: SettingOption[];
  selectedMode: string;
}

export const ModeInfoPanel: React.FC<ModeInfoPanelProps> = ({ modes, selectedMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const selectedModeData = modes.find(mode => mode.value === selectedMode);

  return (
    <div className="relative" ref={panelRef}>
      {/* Info Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors rounded-md hover:bg-zinc-800/50"
        aria-label="Mode information"
      >
        <InformationCircleIcon className="w-4 h-4" />
      </button>

      {/* Info Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-zinc-900/95 backdrop-blur-sm rounded-lg shadow-xl ring-1 ring-zinc-700/50 z-40 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-zinc-700/50">
            <h3 className="font-semibold text-white text-sm">Prompt Modes</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors rounded-md hover:bg-zinc-800/50"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Mode List */}
          <div className="max-h-64 overflow-y-auto">
            {modes.map((mode) => {
              const isSelected = mode.value === selectedMode;
              
              return (
                <div
                  key={mode.value}
                  className={`p-3 border-b border-zinc-800/50 last:border-b-0 ${
                    isSelected ? 'bg-indigo-600/10 border-l-2 border-l-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-semibold text-sm ${
                      isSelected ? 'text-indigo-400' : 'text-white'
                    }`}>
                      {mode.label} Mode
                    </h4>
                    {isSelected && (
                      <span className="px-2 py-0.5 text-xs bg-indigo-600/20 text-indigo-300 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    {parseSimpleMarkdown(mode.description)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 bg-zinc-800/30 border-t border-zinc-700/50">
            <p className="text-xs text-zinc-400">
              💡 Hover over mode buttons for quick previews
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
