import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  initialApiKey: string | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialApiKey }) => {
  const [apiKey, setApiKey] = useState(initialApiKey || '');

  // Sync internal state with prop changes and modal state
  useEffect(() => {
    // Only update if modal is open to avoid unnecessary updates when closed
    if (isOpen) {
      setApiKey(initialApiKey || '');
    }
  }, [isOpen, initialApiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKey);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl ring-1 ring-white/10 w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-slate-100">Settings</h2>
        <p className="text-slate-400 mt-2">
          Your API key is stored securely in your browser's local storage or synced Chrome storage. It is never sent anywhere except to the Google Gemini API.
        </p>
        
        <div className="mt-6">
          <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
            Gemini API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your API key here"
          />
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
};
