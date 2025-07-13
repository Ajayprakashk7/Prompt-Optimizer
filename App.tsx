
import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { RateLimitError, organizePrompt, optimizePrompt } from './services/geminiService';
import { getHistory, addPromptToHistory, deletePromptFromHistory, SavedPrompt, saveHistory } from './services/historyService';
import {
    getOptimizationHistory,
    addOptimizationHistoryEntry,
    deleteOptimizationHistoryEntry,
    clearOptimizationHistory,
    OptimizationHistoryEntry
} from './services/optimizationHistoryService';
import { importPromptHistory } from './services/exportService';
import { interpolateVariables } from './utils/promptUtils';
import { getRemainingRequests } from './services/rateLimitService';
import { hasPersonalApiKey } from './services/configService';

import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { PromptOutput } from './components/PromptOutput';
import { Loader } from './components/Loader';
import { RocketLaunchIcon } from './components/Icons';
import { Footer } from './components/Footer';
import { EXAMPLE_PROMPTS, PROMPT_MODES } from './constants';
import { ModeSelector } from './components/ModeSelector';
import { usePersistentState } from './hooks/usePersistentState';
import { VariableEditor } from './components/VariableEditor';

// Lazy load heavy components that aren't needed immediately
const HistoryPanel = lazy(() => import('./components/HistoryPanel').then(m => ({ default: m.HistoryPanel })));
const OptimizationHistoryPanel = lazy(() => import('./components/OptimizationHistoryPanel').then(m => ({ default: m.OptimizationHistoryPanel })));
const SettingsModal = lazy(() => import('./components/SettingsModal').then(m => ({ default: m.SettingsModal })));


const App: React.FC = () => {
  const [userInput, setUserInput] = usePersistentState('userInput', '');
  const [optimizedPrompt, setOptimizedPrompt] = usePersistentState('optimizedPrompt', '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [promptMode, setPromptMode] = usePersistentState('promptMode', PROMPT_MODES[1].value); // Default to 'Pro'
  const [variables, setVariables] = usePersistentState<Record<string, string>>('variables', {});

  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationHistoryEntry[]>([]);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isOptimizationHistoryOpen, setIsOptimizationHistoryOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [appVersion, setAppVersion] = useState(0); 
  const forceRerender = () => setAppVersion(v => v + 1);

  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(0);

  useEffect(() => {
    // Defer loading of history data to improve initial render performance
    const loadInitialData = async () => {
        // Use requestIdleCallback for better performance
        const loadData = async () => {
            const [prompts, optHistory] = await Promise.all([
                getHistory(),
                getOptimizationHistory(),
            ]);
            setSavedPrompts(prompts);
            setOptimizationHistory(optHistory);
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(loadData);
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(loadData, 0);
        }
    };

    loadInitialData();
  }, []);

  // This effect will run on mount and whenever an API call completes or the key is changed.
  useEffect(() => {
    const refreshUsageData = async () => {
        const [hasKey, remRequests] = await Promise.all([
            hasPersonalApiKey(),
            getRemainingRequests(),
        ]);
        setHasPersonalKey(hasKey);
        setRemainingRequests(remRequests);
    };
    refreshUsageData();
  }, [appVersion]);


  const handleApiError = useCallback((e: unknown) => {
    if (e instanceof Error) {
      setError(e.message);
    } else {
      setError('An unknown error occurred.');
    }
  }, []);
  
  const resetOutputState = useCallback(() => {
    setOptimizedPrompt('');
    setError(null);
  }, [setOptimizedPrompt]);

  const handleOptimize = useCallback(async () => {
    const resolvedInput = interpolateVariables(userInput, variables);
    if (!resolvedInput.trim()) {
      setError('Please enter a prompt to optimize.');
      return;
    }

    setIsLoading(true);
    resetOutputState();

    try {
      const stream = await optimizePrompt(resolvedInput, promptMode);
      let fullResponse = '';

      // Batch updates to reduce re-renders during streaming
      let updateBuffer = '';
      let lastUpdate = Date.now();

      for await (const chunk of stream) {
        updateBuffer += chunk;
        fullResponse += chunk;

        // Throttle updates to every 100ms for better performance
        const now = Date.now();
        if (now - lastUpdate > 100) {
          setOptimizedPrompt(fullResponse);
          lastUpdate = now;
        }
      }

      // Final update
      setOptimizedPrompt(fullResponse);

      if (fullResponse.trim()) {
        // Use requestIdleCallback for non-critical operations
        if ('requestIdleCallback' in window) {
          requestIdleCallback(async () => {
            await addOptimizationHistoryEntry({
                rawPrompt: userInput,
                optimizedPrompt: fullResponse,
                variables,
                mode: promptMode
            });
            const updatedOptHistory = await getOptimizationHistory();
            setOptimizationHistory(updatedOptHistory);
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(async () => {
            await addOptimizationHistoryEntry({
                rawPrompt: userInput,
                optimizedPrompt: fullResponse,
                variables,
                mode: promptMode
            });
            const updatedOptHistory = await getOptimizationHistory();
            setOptimizationHistory(updatedOptHistory);
          }, 0);
        }
      }
      // After a successful operation, refresh usage data
      forceRerender();
    } catch (e) {
      if (e instanceof RateLimitError) {
        setError(e.message);
        setIsSettingsModalOpen(true);
      } else {
        handleApiError(e);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userInput, variables, promptMode, resetOutputState, handleApiError, forceRerender]);
  
  const handleRegenerate = useCallback(async () => {
    await handleOptimize();
  }, [handleOptimize]);

  const handleSavePrompt = useCallback(async () => {
    if (!optimizedPrompt || isSaving) return;
    
    setIsSaving(true);
    setError(null);
    try {
      let title: string;
      let category: string;

      try {
        const organizedData = await organizePrompt(optimizedPrompt);
        title = organizedData.title;
        category = organizedData.category;
        // After a successful operation, refresh usage data
        forceRerender();
      } catch (e) {
        // If rate limited, show modal and abort the save.
        if (e instanceof RateLimitError) {
          setError(e.message);
          setIsSettingsModalOpen(true);
          return; // ABORT. The finally block will still run to set isSaving to false.
        }
        
        // For other errors, log it, notify the user, and fall back to a default title.
        console.warn("Could not organize prompt via AI, saving with default title/category.", e);
        setError("Couldn't generate a title automatically, but your prompt was saved.");
        title = 'Untitled: ' + optimizedPrompt.split('\n')[0].split(' ').slice(0, 4).join(' ') + '...';
        category = 'Uncategorized';
      }
      
      const newPrompt: SavedPrompt = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        prompt: userInput,
        optimizedPrompt: optimizedPrompt,
        title,
        category,
        createdAt: new Date().toISOString(),
        variables, 
      };
      await addPromptToHistory(newPrompt);
      const updatedHistory = await getHistory();
      setSavedPrompts(updatedHistory);
    } catch(e) {
      handleApiError(e);
    } finally {
      setIsSaving(false);
    }
  }, [optimizedPrompt, userInput, variables, isSaving, handleApiError]);

  const handleDeletePrompt = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this saved prompt? This action cannot be undone.')) {
      await deletePromptFromHistory(id);
      const updatedHistory = await getHistory();
      setSavedPrompts(updatedHistory);
    }
  }, []);

  const handleUsePrompt = useCallback((prompt: SavedPrompt) => {
    resetOutputState();
    setUserInput(prompt.prompt);
    setOptimizedPrompt(prompt.optimizedPrompt || '');
    setVariables(prompt.variables || {}); 
    setIsHistoryOpen(false);
  }, [setUserInput, setVariables, setOptimizedPrompt, resetOutputState]);
    
  const handleUseOptimization = useCallback((entry: OptimizationHistoryEntry) => {
    resetOutputState();
    setUserInput(entry.rawPrompt);
    setOptimizedPrompt(entry.optimizedPrompt);
    setVariables(entry.variables || {});
    setPromptMode(entry.mode);
    setIsOptimizationHistoryOpen(false);
  }, [setUserInput, setVariables, setPromptMode, setOptimizedPrompt, resetOutputState]);
  
  const handleDeleteOptimization = useCallback(async (id: string) => {
    await deleteOptimizationHistoryEntry(id);
    const updatedHistory = await getOptimizationHistory();
    setOptimizationHistory(updatedHistory);
  }, []);

  const handleClearOptimizationHistory = useCallback(async () => {
    if (window.confirm('Are you sure you want to clear the entire optimization history? This cannot be undone.')) {
      await clearOptimizationHistory();
      setOptimizationHistory([]);
    }
  }, []);

  const handleImportHistory = useCallback(async (file: File) => {
    try {
        const imported = await importPromptHistory(file);
        const current = await getHistory();
        // Simple merge: add new, don't update existing by id.
        const newPrompts = imported.filter(p => !current.some(c => c.id === p.id));
        const merged = [...newPrompts, ...current];
        await saveHistory(merged);
        setSavedPrompts(await getHistory());
        alert(`${newPrompts.length} new prompts imported successfully!`);
    } catch(e) {
        console.error("Import failed", e);
        alert(`Import failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }, []);
  
  const handleApiKeyChange = useCallback(() => {
    forceRerender();
  }, []);

  const handleRefinePrompt = useCallback((prompt: string) => {
    setUserInput(`Refine the following prompt to be more concise:\n\n---\n\n${prompt}`);
    resetOutputState();
  }, [setUserInput, resetOutputState]);

  const onHistoryClick = useCallback(() => setIsHistoryOpen(true), []);
  const onOptimizationHistoryClick = useCallback(() => setIsOptimizationHistoryOpen(true), []);
  const onSettingsClick = useCallback(() => setIsSettingsModalOpen(true), []);
  
  const handleUserInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    if (error) setError(null);
  }, [error, setUserInput]);

  return (
    <div className="extension-container bg-zinc-950">
      <Header
        onHistoryClick={onHistoryClick}
        onOptimizationHistoryClick={onOptimizationHistoryClick}
        onSettingsClick={onSettingsClick}
        hasPersonalKey={hasPersonalKey}
        remainingRequests={remainingRequests}
      />

      <main className="extension-main">
        <div className="responsive-grid">
          {/* Left Column */}
          <div className="responsive-column">
            <div className="flex flex-col flex-grow min-h-0">
              <PromptInput
                value={userInput}
                onChange={handleUserInputChange}
                placeholder="e.g., Refactor this Python function to be more efficient..."
                starters={EXAMPLE_PROMPTS}
                onStarterClick={(starter) => setUserInput(starter.prompt)}
                grow={true}
              />
            </div>

            <div className="flex-shrink-0 space-y-4">
              <VariableEditor
                promptText={userInput}
                variables={variables}
                onVariablesChange={setVariables}
              />

              <ModeSelector
                modes={PROMPT_MODES}
                selectedMode={promptMode}
                onSelectMode={setPromptMode}
              />

              <button
                onClick={handleOptimize}
                disabled={isLoading}
                className="touch-target w-full bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-wait"
                style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-3)' }}
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? <Loader /> : <RocketLaunchIcon className="h-5 w-5" />}
                  {isLoading ? 'Optimizing...' : 'Optimize Prompt'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="responsive-column">
            <PromptOutput
              prompt={optimizedPrompt}
              isLoading={isLoading}
              onSave={handleSavePrompt}
              isSaving={isSaving}
              onRefine={handleRefinePrompt}
              onRegenerate={handleRegenerate}
              error={error}
              onErrorDismiss={() => setError(null)}
            />
          </div>
        </div>
      </main>

      <Footer />
      
      <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center"><Loader /></div>}>
        <HistoryPanel
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          prompts={savedPrompts}
          onUse={handleUsePrompt}
          onDelete={handleDeletePrompt}
          onImport={handleImportHistory}
        />

        <OptimizationHistoryPanel
          isOpen={isOptimizationHistoryOpen}
          onClose={() => setIsOptimizationHistoryOpen(false)}
          history={optimizationHistory}
          onUse={handleUseOptimization}
          onDelete={handleDeleteOptimization}
          onClear={handleClearOptimizationHistory}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onKeyChange={handleApiKeyChange}
        />
      </Suspense>

    </div>
  );
};

export default App;
