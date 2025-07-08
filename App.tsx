import React, { useState, useCallback, useEffect, Suspense, lazy, useMemo } from 'react';
import { optimizePrompt } from './services/geminiService';
import { getApiKey, saveApiKey } from './services/configService';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { PromptOutput } from './components/PromptOutput';
import { Loader } from './components/Loader';
import { MagicWandIcon, UserCircleIcon, PaintBrushIcon } from './components/Icons';
import { Footer } from './components/Footer';
import { examplePrompts, personas, vibes } from './data/prompts';

// Lazy load SettingsModal since it's not always needed
const SettingsModal = lazy(() => import('./components/SettingsModal').then(module => ({ default: module.SettingsModal })));

export const App: React.FC = () => {
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
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 bg-slate-900 text-slate-300">
      <Suspense fallback={<div />}>
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={handleSettingsClose}
          onSave={handleSaveKey}
          initialApiKey={apiKey}
        />
      </Suspense>
      <Header 
        onSettingsClick={handleSettingsOpen} 
        refreshTrigger={refreshUsage}
      />
      
      <main className="flex-grow flex flex-col gap-6 mt-6">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          
          {/* Left Column: Input */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <PromptInput
              value={userInput}
              onChange={handleInputChange}
              placeholder="Start with a simple idea, like 'write a story about a lonely robot'..."
              starters={examplePrompts}
              onStarterClick={handleStarterClick}
            />
            
            {/* Persona and Vibe Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <UserCircleIcon />
                  Persona
                </label>
                <select
                  value={selectedPersona}
                  onChange={handlePersonaChange}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {personaOptions}
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <PaintBrushIcon />
                  Vibe
                </label>
                <select
                  value={selectedVibe}
                  onChange={handleVibeChange}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {vibeOptions}
                </select>
              </div>
            </div>

            <button
              onClick={handleOptimize}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-lg font-bold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-wait transition-all transform hover:scale-105"
            >
              {isLoading ? <Loader /> : <MagicWandIcon />}
              {isLoading ? 'Optimizing...' : 'Optimize Prompt'}
            </button>
            {error && <p className="text-center text-red-400 text-sm mt-2">{error}</p>}
          </div>

          {/* Right Column: Output */}
          <div className="lg:w-1/2">
            <PromptOutput prompt={optimizedPrompt} isLoading={isLoading} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;