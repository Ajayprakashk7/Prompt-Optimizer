import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ModeSelector } from './ModeSelector';
import { Loader } from './Loader';
import { TEMPLATE_CATEGORIES } from '../constants/promptTemplates';
import { PROMPT_MODES } from '../constants/settings';
import { storage } from '../services/storageService';
// Placeholder imports for subcomponents (to be implemented)
// import ArchitectMode from './ArchitectMode';
// import FreestyleMode from './FreestyleMode';
// import TemplateManager from './TemplateManager';
// import ExportImportPanel from './ExportImportPanel';

// Types (should be imported from types directory)
interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  mode: 'architect' | 'freestyle';
  content: any;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

type Mode = 'architect' | 'freestyle';

enum ArchitectStep {
  SPECIFICATION = 'specification',
  RULES = 'rules',
  PREVIEW = 'preview',
}

const AUTOSAVE_KEY = 'promptTemplateSystem_autosave';

export const PromptTemplateSystem: React.FC = () => {
  // State
  const [mode, setMode] = useState<Mode>('architect');
  const [workflowStep, setWorkflowStep] = useState<ArchitectStep>(ArchitectStep.SPECIFICATION);
  const [currentTemplate, setCurrentTemplate] = useState<PromptTemplate | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load saved templates on mount
  useEffect(() => {
    setIsLoading(true);
    storage.get<PromptTemplate[]>('promptTemplates')
      .then((templates) => {
        setSavedTemplates(templates || []);
        setIsLoading(false);
      })
      .catch((e) => {
        setError('Failed to load templates.');
        setIsLoading(false);
      });
  }, []);

  // Autosave current template (context-aware, debounced)
  useEffect(() => {
    if (!currentTemplate) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      storage.set(AUTOSAVE_KEY, currentTemplate);
    }, 800);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [currentTemplate]);

  // Restore autosaved template on mount
  useEffect(() => {
    storage.get<PromptTemplate>(AUTOSAVE_KEY).then((tpl) => {
      if (tpl) setCurrentTemplate(tpl);
    });
  }, []);

  // Mode toggle handler with unsaved changes check
  const handleModeChange = useCallback((newMode: string) => {
    if (mode === newMode) return;
    // TODO: Prompt user if unsaved changes exist
    setMode(newMode as Mode);
    // Optionally attempt to parse/convert content between modes
  }, [mode]);

  // Template save handler
  const handleSaveTemplate = useCallback(async (tpl: PromptTemplate) => {
    setIsLoading(true);
    try {
      const updatedTemplates = [...savedTemplates.filter(t => t.id !== tpl.id), tpl];
      setSavedTemplates(updatedTemplates);
      await storage.set('promptTemplates', updatedTemplates);
      setCurrentTemplate(tpl);
    } catch (e) {
      setError('Failed to save template.');
    } finally {
      setIsLoading(false);
    }
  }, [savedTemplates]);

  // Template delete handler
  const handleDeleteTemplate = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const updatedTemplates = savedTemplates.filter(t => t.id !== id);
      setSavedTemplates(updatedTemplates);
      await storage.set('promptTemplates', updatedTemplates);
      if (currentTemplate?.id === id) setCurrentTemplate(null);
    } catch (e) {
      setError('Failed to delete template.');
    } finally {
      setIsLoading(false);
    }
  }, [savedTemplates, currentTemplate]);

  // Template search/filter
  const filteredTemplates = savedTemplates.filter(t => {
    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content?.specification?.toLowerCase?.().includes(searchQuery.toLowerCase()) ||
      t.content?.rules?.toLowerCase?.().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? t.category === selectedCategory : true;
    return matchesQuery && matchesCategory;
  });

  // Accessibility: focus management for error
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  // Render
  return (
    <div className="flex flex-col w-full h-full bg-zinc-900 text-zinc-100">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
        <h2 className="text-xl font-bold">Advanced Prompt Template System</h2>
        <ModeSelector
          modes={[{ value: 'architect', label: 'Architect', description: 'Guided, structured workflow for high-quality prompts.' }, { value: 'freestyle', label: 'Freestyle', description: 'Rapid, flexible prompt editing.' }]}
          selectedMode={mode}
          onSelectMode={handleModeChange}
        />
      </div>

      {error && (
        <div
          ref={errorRef}
          tabIndex={-1}
          className="bg-red-700 text-white p-3 m-4 rounded shadow focus:outline-none"
          role="alert"
          aria-live="assertive"
        >
          {error}
          <button className="ml-4 underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader />
        </div>
      )}

      {/* Main Content Area */}
      {!isLoading && (
        <div className="flex flex-1 min-h-0">
          {/* Left: Template Manager & Categories */}
          <aside className="w-72 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-4">
            <div>
              <input
                type="text"
                className="w-full p-2 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 focus:ring-2 focus:ring-indigo-500"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search templates"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Category</label>
              <select
                className="w-full p-2 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 focus:ring-2 focus:ring-indigo-500"
                value={selectedCategory || ''}
                onChange={e => setSelectedCategory(e.target.value || null)}
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {TEMPLATE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ul className="space-y-2">
                {filteredTemplates.length === 0 ? (
                  <li className="text-zinc-400 text-sm">No templates found.</li>
                ) : (
                  filteredTemplates.map(tpl => (
                    <li key={tpl.id} className={`p-2 rounded cursor-pointer hover:bg-zinc-800 ${currentTemplate?.id === tpl.id ? 'bg-indigo-900/60' : ''}`}
                      onClick={() => setCurrentTemplate(tpl)}
                      tabIndex={0}
                      aria-selected={currentTemplate?.id === tpl.id}
                    >
                      <div className="font-semibold text-indigo-300">{tpl.name}</div>
                      <div className="text-xs text-zinc-400">{tpl.category}</div>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <button
              className="w-full bg-indigo-600 text-white font-semibold rounded-lg py-2 mt-2 hover:bg-indigo-500 transition-colors"
              onClick={() => setCurrentTemplate(null)}
            >
              + New Template
            </button>
          </aside>

          {/* Center: Main Editor Area */}
          <main className="flex-1 flex flex-col min-h-0">
            {/* Placeholder for mode-specific editors */}
            <div className="flex-1 min-h-0">
              {mode === 'architect' ? (
                <div className="p-6">
                  {/* <ArchitectMode ... /> */}
                  <div className="text-zinc-400">Architect Mode Editor (to be implemented)</div>
                </div>
              ) : (
                <div className="p-6">
                  {/* <FreestyleMode ... /> */}
                  <div className="text-zinc-400">Freestyle Mode Editor (to be implemented)</div>
                </div>
              )}
            </div>
            {/* Placeholder for preview panel */}
            <div className="border-t border-zinc-800 bg-zinc-950 p-4">
              <div className="font-semibold mb-2">Live Preview</div>
              <div className="bg-zinc-900 rounded p-3 min-h-[80px] text-zinc-200">
                {previewContent || <span className="text-zinc-500">Preview will appear here...</span>}
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default PromptTemplateSystem;