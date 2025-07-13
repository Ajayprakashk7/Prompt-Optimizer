
import React, { useState, useEffect } from 'react';
import { getApiKey, saveApiKey, clearApiKey } from '../services/configService';
import { XMarkIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyChange: () => void;
}

export const SettingsModal = React.memo<SettingsModalProps>(({ isOpen, onClose, onKeyChange }) => {
  const [keyInput, setKeyInput] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchKey = async () => {
        const existingKey = await getApiKey();
        setKeyInput(existingKey || '');
        setHasExistingKey(!!existingKey);
      };
      fetchKey();
    }
  }, [isOpen]);

  const handleSave = async () => {
    await saveApiKey(keyInput);
    onKeyChange();
    onClose();
    alert('API Key saved!');
  };

  const handleClear = async () => {
    await clearApiKey();
    setKeyInput('');
    onKeyChange();
    setHasExistingKey(false);
    alert('API Key cleared. Using the shared key with daily limits.');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      style={{ padding: 'var(--container-padding)' }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-md relative ring-1 ring-white/10"
        style={{
          padding: 'var(--space-6)',
          maxWidth: 'min(90vw, 28rem)',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="touch-target absolute text-zinc-400 hover:text-white transition-colors"
          style={{ top: 'var(--space-3)', right: 'var(--space-3)', padding: 'var(--space-1)' }}
          aria-label="Close settings"
        >
          <XMarkIcon />
        </button>
        <h2 className="font-bold text-high-contrast" style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>API Key Settings</h2>
        <p className="text-medium-contrast" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.6', marginBottom: 'var(--space-3)' }}>
          The app includes 5 free optimizations per day. For unlimited use, add your own Google Gemini API key. Your key is stored securely in your browser's local storage.
        </p>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 font-medium block"
          style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)' }}
        >
          Get your free key from Google AI Studio &rarr;
        </a>

        <label htmlFor="api-key-input" className="block font-medium text-medium-contrast" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
          Your Google Gemini API Key
        </label>
        <input
          id="api-key-input"
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="Enter your API key"
          className="w-full bg-zinc-800 border border-zinc-700 text-high-contrast rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          style={{ fontSize: 'var(--text-sm)', lineHeight: '1.5', padding: 'var(--space-3)' }}
        />

        <div className="flex justify-between items-center" style={{ marginTop: 'var(--space-6)' }}>
           <div>
            {hasExistingKey && (
              <button
                onClick={handleClear}
                className="touch-target font-medium text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-3)' }}
              >
                Clear Key
              </button>
            )}
           </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="touch-target font-medium text-medium-contrast bg-zinc-700 hover:bg-zinc-600 rounded-md transition-colors"
              style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-3)' }}
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={!keyInput.trim()}
              className="touch-target font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-3)' }}
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
