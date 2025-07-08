import React, { useState, useEffect, useCallback, memo } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

interface PromptOutputProps {
  prompt: string;
  isLoading: boolean;
}

const SkeletonLoader: React.FC = memo(() => (
    <div className="p-4 w-full h-full overflow-hidden">
        <div className="relative animate-[shimmer_1.5s_infinite]">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-slate-800 via-slate-700/50 to-slate-800"></div>
            <div className="space-y-4">
                <div className="h-5 bg-slate-700 rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-full"></div>
                  <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="h-5 bg-slate-700 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-full"></div>
                  <div className="h-4 bg-slate-700 rounded w-full"></div>
                  <div className="h-4 bg-slate-700 rounded w-4/6"></div>
                </div>
                 
                <div className="pt-4 space-y-2">
                  <div className="h-5 bg-slate-700 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                </div>
            </div>
        </div>
    </div>
));

export const PromptOutput: React.FC<PromptOutputProps> = memo(({ prompt, isLoading }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = useCallback(() => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setCopied(true);
    }
  }, [prompt]);

  return (
    <div className="relative flex flex-col h-full bg-slate-800/50 rounded-xl shadow-2xl ring-1 ring-white/10">
      <div className="flex-shrink-0 flex justify-between items-center bg-slate-700/50 px-3 py-2 rounded-t-xl">
        <h2 className="text-sm font-semibold text-slate-300">Optimized Prompt</h2>
        <button
          onClick={handleCopy}
          disabled={!prompt || copied}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="flex-grow p-1 overflow-auto min-h-0">
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <pre className="w-full h-full p-3 whitespace-pre-wrap break-words font-sans text-slate-200">
            {prompt || <span className="text-slate-500">Your optimized prompt will appear here...</span>}
          </pre>
        )}
      </div>
    </div>
  );
});