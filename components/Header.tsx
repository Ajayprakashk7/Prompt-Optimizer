import React from 'react';
import { LogoIcon, BookmarkIcon, KeyIcon, HistoryIcon } from './Icons';

interface HeaderProps {
  onHistoryClick: () => void;
  onOptimizationHistoryClick: () => void;
  onSettingsClick: () => void;
  hasPersonalKey: boolean;
  remainingRequests: number;
}

export const Header = React.memo<HeaderProps>(({ onHistoryClick, onOptimizationHistoryClick, onSettingsClick, hasPersonalKey, remainingRequests }) => {
  return (
    <header className="flex items-center justify-between border-b border-zinc-800/50 flex-shrink-0 glass-panel" style={{ padding: 'var(--space-2) var(--container-padding)', minHeight: '48px' }}>
      <div className="flex items-center gap-2">
        <LogoIcon />
        <div className="text-left min-w-0">
          <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500 truncate glass-text" style={{ fontSize: 'var(--text-lg)' }}>
            Prompt Optimizer
          </h1>
          <p className="text-medium-contrast truncate glass-text-subtle" style={{ fontSize: 'var(--text-xs)', lineHeight: '1.2', marginTop: '1px' }}>
            Transform your ideas into exceptional AI prompts.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {hasPersonalKey ? null : (
            <div
              className="font-medium text-subtle-contrast glass-card ring-1 ring-zinc-700/50 rounded-full"
              style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }}
              aria-live="polite"
            >
              {remainingRequests} Request{remainingRequests !== 1 ? 's' : ''} Left
            </div>
        )}
        <button
          onClick={onHistoryClick}
          className="p-1.5 rounded-full text-zinc-400 hover:glass-hover glass-card transition-all"
          aria-label="Saved Prompts"
          title="Saved Prompts (Templates)"
        >
          <BookmarkIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onOptimizationHistoryClick}
          className="p-1.5 rounded-full text-zinc-400 hover:glass-hover glass-card transition-all"
          aria-label="Optimization History"
          title="Optimization History"
        >
          <HistoryIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onSettingsClick}
          className="p-1.5 rounded-full text-zinc-400 hover:glass-hover glass-card transition-all"
          aria-label="API Key Settings"
          title="API Key Settings"
        >
          <KeyIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
});