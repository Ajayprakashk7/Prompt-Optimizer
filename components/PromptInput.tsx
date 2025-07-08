import React, { useState, useEffect, useMemo, memo } from 'react';

interface PromptStarter {
  title: string;
  prompt: string;
}

interface PromptInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  starters: PromptStarter[];
  onStarterClick: (prompt: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = memo(({ value, onChange, placeholder, starters, onStarterClick }) => {
  const [currentStarters, setCurrentStarters] = useState<PromptStarter[]>([]);

  // Memoize the shuffle function to avoid recreating it on every render
  const shuffleAndPick = useMemo(() => {
    return () => {
      if (starters.length === 0) return;
      
      // Fisher-Yates shuffle
      const shuffled = [...starters];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setCurrentStarters(shuffled.slice(0, 4)); // Show 4 random tags
    };
  }, [starters]);

  useEffect(() => {
    if (starters.length === 0) return;

    shuffleAndPick(); // Initial set
    const intervalId = setInterval(shuffleAndPick, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId);
  }, [shuffleAndPick]);

  return (
    <div className="flex flex-col bg-slate-800/50 rounded-xl shadow-lg ring-1 ring-white/10 h-full">
      <div className="flex-shrink-0 bg-slate-700/50 px-3 py-2 rounded-t-xl">
        <h2 className="text-sm font-semibold text-slate-300">Your Raw Prompt</h2>
      </div>
      <div className="flex-grow p-1 min-h-0">
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-full min-h-[120px] bg-transparent text-slate-200 resize-none p-3 focus:outline-none placeholder-slate-500"
        />
      </div>
      <div className="border-t border-slate-700/50 px-3 py-2 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex-shrink-0">Try:</span>
          {currentStarters.map((starter) => (
            <button
              key={starter.title}
              onClick={() => onStarterClick(starter.prompt)}
              className="px-2 py-0.5 text-xs font-medium text-indigo-200 bg-indigo-900/50 rounded hover:bg-indigo-800/70 transition-colors"
            >
              {starter.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});