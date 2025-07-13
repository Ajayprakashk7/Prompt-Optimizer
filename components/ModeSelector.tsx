import React, { useMemo } from 'react';
import { TuneIcon } from './Icons';
import { parseSimpleMarkdown } from '../utils/simpleMarkdown';
import type { SettingOption } from '../types/prompt';

interface ModeSelectorProps {
  modes: SettingOption[];
  selectedMode: string;
  onSelectMode: (mode: string) => void;
}



export const ModeSelector = React.memo<ModeSelectorProps>(({ modes, selectedMode, onSelectMode }) => {
  // Get current mode index for indicator positioning
  const currentModeIndex = useMemo(() =>
    modes.findIndex(mode => mode.value === selectedMode),
    [modes, selectedMode]
  );



  // Handle mode selection
  const handleModeSelect = (modeValue: string) => {
    if (modeValue === selectedMode) return;

    // Add haptic feedback for supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    onSelectMode(modeValue);
  };

  // Calculate indicator position and width
  const getIndicatorStyle = () => {
    const baseWidth = 100 / modes.length;
    const position = currentModeIndex * baseWidth;

    return {
      left: `${position}%`,
      width: `${baseWidth}%`,
    };
  };

  return (
    <div className="w-full">
      <label className="flex items-center gap-2 font-medium text-zinc-300 mb-2" style={{ fontSize: 'var(--text-sm)' }}>
        <TuneIcon />
        Prompt Mode
      </label>

      {/* Switch-Style Mode Selector - Matching Extension Design */}
      <div className="relative w-full bg-zinc-800 rounded-lg p-1 ring-1 ring-zinc-700">
        {/* Sliding Indicator */}
        <div
          className="absolute top-1 bottom-1 bg-indigo-600 rounded-md transition-all duration-300 ease-out shadow-lg"
          style={getIndicatorStyle()}
        />

        {/* Mode Buttons */}
        <div className="relative flex">
          {modes.map((mode) => {
            const isActive = selectedMode === mode.value;

            return (
              <button
                key={mode.value}
                onClick={() => handleModeSelect(mode.value)}
                className={`
                  mode-selector-button group relative flex-1 flex items-center justify-center gap-2 py-1.5 px-2.5
                  rounded-md transition-all duration-300 ease-out
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
                  ${isActive ? 'text-white font-semibold z-10' : 'text-zinc-400 hover:text-zinc-200'}
                `}
                style={{
                  fontSize: 'var(--text-xs)',
                  minHeight: '32px'
                }}
                aria-pressed={isActive}
                aria-label={`${mode.label} mode`}
              >
                {/* Label */}
                <span className="font-medium">
                  {mode.label}
                </span>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-2 text-xs text-left text-zinc-300 bg-zinc-950 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ring-1 ring-zinc-700 shadow-lg z-20">
                  <div className="font-medium text-white mb-1">{mode.label} Mode</div>
                  {parseSimpleMarkdown(mode.description)}

                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-950"></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});