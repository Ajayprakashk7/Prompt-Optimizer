import React, { useState, useCallback, useEffect, Suspense, lazy, useMemo } from 'react';
import { optimizePrompt } from './services/geminiService';
import { getApiKey, saveApiKey } from './services/configService';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { PromptOutput } from './components/PromptOutput';
import { Loader } from './components/Loader';
import { MagicWandIcon, UserCircleIcon, PaintBrushIcon } from './components/Icons';
import { Footer } from './components/Footer';
import { extensionExamplePrompts, personas, vibes } from './data/prompts';

// Lazy load SettingsModal since it's not always needed
const SettingsModal = lazy(() => import('./components/SettingsModal').then(module => ({ default: module.SettingsModal })));

export const ExtensionApp: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState('Default');
  const [selectedVibe, setSelectedVibe] = useState('Default');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [refreshUsage, setRefreshUsage] = useState(0); // Trigger for usage refresh

  useEffect(() => {
    const loadApiKey = async () => {
      const savedKey = await getApiKey();
      setApiKey(savedKey || '');
    };
    loadApiKey();
  }, []);

  const handleOptimize = useCallback(async () => {
    if (!userInput.trim()) {
      setError('Please enter a prompt to optimize.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await optimizePrompt(userInput, selectedVibe, selectedPersona);
      setOptimizedPrompt(result);
      setRefreshUsage(prev => prev + 1); // Trigger usage refresh
    } catch (err) {
      console.error('Error optimizing prompt:', err);
      if (err instanceof Error) {
        if (err.message.includes('Daily limit reached')) {
          // Only show settings modal when limit is actually reached
          setError(err.message);
          setIsSettingsOpen(true);
        } else if (err.message.includes('API_KEY_INVALID') || err.message.includes('API key')) {
          setError('Invalid API key. Please check your Gemini API key in settings.');
          setIsSettingsOpen(true);
        } else {
          setError(err.message || 'Failed to optimize prompt. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userInput, selectedVibe, selectedPersona]);

  const handleSaveKey = useCallback(async (newKey: string) => {
    await saveApiKey(newKey);
    setApiKey(newKey);
    setError(null);
  }, []);

  const handlePersonaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPersona(e.target.value);
  }, []);

  const handleVibeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVibe(e.target.value);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  }, []);

  const handleStarterClick = useCallback((prompt: string) => {
    setUserInput(prompt);
  }, []);

  const handleSettingsOpen = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  // Memoize persona options to prevent re-rendering
  const personaOptions = useMemo(() => 
    personas.map((persona) => (
      <option key={persona} value={persona}>
        {persona}
      </option>
    )), []);

  // Memoize vibe options to prevent re-rendering
  const vibeOptions = useMemo(() => 
    vibes.map((vibe) => (
      <option key={vibe} value={vibe}>
        {vibe}
      </option>
    )), []);

  return (
    <div className="w-[800px] h-[600px] flex flex-col p-3 overflow-hidden bg-slate-900 text-slate-300">
      <Suspense fallback={<div />}>
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={handleSettingsClose}
          onSave={handleSaveKey}
          initialApiKey={apiKey}
        />
      </Suspense>
      
      <div className="flex-shrink-0">
        <Header 
          onSettingsClick={handleSettingsOpen} 
          refreshTrigger={refreshUsage}
        />
      </div>
      
      <main className="flex-grow flex flex-col gap-2 mt-2 overflow-hidden">
        <div className="w-full flex gap-3 h-full">
          
          {/* Left Column: Input */}
          <div className="w-1/2 flex flex-col gap-2 min-h-0">
            <div className="flex-grow min-h-0 flex flex-col">
              <div className="flex-grow min-h-0">
                <PromptInput
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder="Enter your prompt idea..."
                  starters={extensionExamplePrompts}
                  onStarterClick={handleStarterClick}
                />
              </div>
              
              {/* Compact Persona and Vibe Selection */}
              <div className="flex gap-2 flex-shrink-0 mt-2">
              <div className="flex-1">
                <label className="flex items-center gap-1 text-xs font-medium text-slate-300 mb-1">
                  <UserCircleIcon />
                  Persona
                </label>
                <select
                  value={selectedPersona}
                  onChange={handlePersonaChange}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                >
                  {personaOptions}
                </select>
              </div>
              
              <div className="flex-1">
                <label className="flex items-center gap-1 text-xs font-medium text-slate-300 mb-1">
                  <PaintBrushIcon />
                  Vibe
                </label>
                <select
                  value={selectedVibe}
                  onChange={handleVibeChange}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                >
                  {vibeOptions}
                </select>
              </div>
            </div>

            <button
              onClick={handleOptimize}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-wait transition-all flex-shrink-0 mt-2"
            >
              {isLoading ? <Loader /> : <MagicWandIcon />}
              {isLoading ? 'Optimizing...' : 'Optimize Prompt'}
            </button>
            {error && <p className="text-center text-red-400 text-xs mt-1 flex-shrink-0">{error}</p>}
              </div>
            </div>

          {/* Right Column: Output */}
          <div className="w-1/2 min-h-0">
            <PromptOutput prompt={optimizedPrompt} isLoading={isLoading} />
          </div>
        </div>
      </main>
      
      <div className="flex-shrink-0 mt-1">
        <Footer />
      </div>
    </div>
  );
};

export default ExtensionApp;
