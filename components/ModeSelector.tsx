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
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 font-medium glass-text" style={{ fontSize: 'var(--text-sm)' }}>
          <TuneIcon />
          Prompt Mode
        </label>
      </div>

      {/* Switch-Style Mode Selector - Matching Extension Design */}
      <div className="relative w-full glass-panel rounded-lg p-1 ring-1 ring-zinc-700/50">
        {/* Sliding Indicator */}
        <div
          className="absolute top-1 bottom-1 glass-button rounded-md transition-all duration-300 ease-out shadow-lg"
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

                {/* Smart Tooltip with Responsive Positioning */}
                <div className={`absolute bottom-full mb-3 w-64 px-3 py-2.5 text-xs text-left text-zinc-300 glass-panel-lg backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none ring-1 ring-zinc-700/50 shadow-xl z-30 transform group-hover:translate-y-0 translate-y-1 ${
                  mode.value === modes[0].value ? 'left-0' :
                  mode.value === modes[modes.length - 1].value ? 'right-0' :
                  'left-1/2 -translate-x-1/2'
                }`}>
                  <div className="font-semibold glass-text mb-1.5 text-sm">{mode.label} Mode</div>
                  <div className="glass-text-subtle leading-relaxed">
                    {parseSimpleMarkdown(mode.description)}
                  </div>

                  {/* Smart Tooltip arrow */}
                  <div className={`absolute top-full border-4 border-transparent border-t-zinc-950/95 ${
                    mode.value === modes[0].value ? 'left-4' :
                    mode.value === modes[modes.length - 1].value ? 'right-4' :
                    'left-1/2 -translate-x-1/2'
                  }`}></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});