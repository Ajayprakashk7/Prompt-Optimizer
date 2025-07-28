
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { LightBulbIcon, ArrowPathIcon } from './Icons';
import type { PromptStarter } from '../types/prompt';
import { tokenizerService } from '../services/tokenizerService';

// --- Sub-components ---

// Token/Word Counter with debounced token calculation
const StatsCounter: React.FC<{ text: string }> = ({ text }) => {
    const [debouncedText, setDebouncedText] = useState(text);
    const [tokenCount, setTokenCount] = useState<number | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedText(text);
        }, 300); // 300ms debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [text]);

    useEffect(() => {
        let isMounted = true;
        if (debouncedText.trim() === '') {
            setTokenCount(0);
            return;
        }

        // Offload token calculation to the web worker via the service
        tokenizerService.calculateTokens(debouncedText).then(count => {
            if (isMounted) {
                setTokenCount(count);
            }
        }).catch(error => {
            console.error("Token calculation failed:", error);
            if(isMounted) {
                // Display '--' to indicate an error, matching the initial state
                setTokenCount(null);
            }
        });
        
        return () => { isMounted = false; }
    }, [debouncedText]);

    const wordCount = useMemo(() => {
        if (!debouncedText) return 0;
        return debouncedText.trim().split(/\s+/).filter(Boolean).length;
    }, [debouncedText]);

    return (
        <div className="text-xs text-zinc-500 space-x-2 glass-text-subtle">
            <span>{tokenCount === null ? '--' : tokenCount} tokens</span>
            <span className="text-zinc-600">/</span>
            <span>{wordCount} words</span>
        </div>
    );
};


// --- Main PromptInput Component ---
interface PromptInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  starters: PromptStarter[];
  onStarterClick: (starter: PromptStarter) => void;
  grow?: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = React.memo(({ value, onChange, placeholder, starters, onStarterClick, grow = false }) => {
  const [currentStarterIndex, setCurrentStarterIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual shuffle function
  const shuffleStarters = useCallback(() => {
    setIsRefreshing(true);
    setCurrentStarterIndex(prev => (prev + 1) % starters.length);

    // Reset refresh animation after a short delay
    setTimeout(() => setIsRefreshing(false), 300);
  }, [starters.length]);

  // Removed auto-cycling as per user preference for static UI elements

  // Memoize the visible starter to prevent unnecessary re-renders
  const visibleStarter = useMemo(() => starters[currentStarterIndex], [starters, currentStarterIndex]);

  // Memoize the starter click handler
  const handleStarterClick = useCallback(() => {
    onStarterClick(visibleStarter);
  }, [onStarterClick, visibleStarter]);

  return (
    <div className={`flex flex-col gap-2 ${grow ? 'flex-grow h-full' : ''}`}>
        <div className="flex justify-between items-center">
             <label htmlFor="prompt-input" className="text-sm font-medium glass-text">
                Your Raw Prompt
             </label>
            <StatsCounter text={value} />
        </div>
      <textarea
        id="prompt-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full glass-input text-high-contrast resize-none ${grow ? 'flex-grow min-h-0' : ''}`}
        style={{
          padding: 'var(--space-3)',
          fontSize: 'var(--text-sm)',
          lineHeight: '1.7',
          letterSpacing: '0.01em'
        }}
      />
      <div className="flex items-center gap-2 text-zinc-400" style={{ fontSize: 'var(--text-xs)' }}>
        <span className="text-zinc-400 glass-text-subtle">
          Example:
        </span>
        {visibleStarter && (
          <button
            key={visibleStarter.title}
            onClick={handleStarterClick}
            className="px-2 py-1 glass-card hover:glass-hover rounded-md transition-all duration-200 text-zinc-300 hover:scale-105 glass-text"
            style={{
              fontSize: 'var(--text-xs)',
              animation: 'fadeSlideIn 0.3s ease-out'
            }}
          >
            {visibleStarter.title}
          </button>
        )}
        <button
          onClick={shuffleStarters}
          className={`p-1.5 glass-card hover:glass-hover rounded-md transition-all duration-200 text-zinc-400 hover:scale-110 ${isRefreshing ? 'animate-spin' : ''}`}
          style={{ fontSize: 'var(--text-xs)' }}
          title="Get a new example"
        >
          <ArrowPathIcon className="w-3 h-3" />
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
});
