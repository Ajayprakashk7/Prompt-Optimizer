
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SavedPrompt } from '../services/historyService';
import { exportPromptHistory, exportPromptsAsMarkdown, exportPromptsAsText } from '../services/exportService';
import { CopyIcon, CheckIcon, TrashIcon, XMarkIcon, UploadIcon, DownloadIcon, VariableIcon } from './Icons';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: SavedPrompt[];
  onUse: (prompt: SavedPrompt) => void;
  onDelete: (id: string) => void;
  onImport: (file: File) => void;
}

const HistoryItem: React.FC<{
    item: SavedPrompt;
    onUse: () => void;
    onDelete: () => void;
}> = ({ item, onUse, onDelete }) => {
    const [copied, setCopied] = React.useState(false);
    const isTemplate = /\{\{[a-zA-Z0-9_]+\}\}/.test(item.prompt);

    const handleCopy = () => {
        navigator.clipboard.writeText(item.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-zinc-800/80 rounded-lg p-3 flex flex-col gap-3 transition-all hover:bg-zinc-700/70 ring-1 ring-zinc-700/50">
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-xs text-zinc-100 pr-2">{item.title}</h3>
                {isTemplate && (
                    <div className="flex-shrink-0 group relative">
                        <VariableIcon className="w-4 h-4 text-indigo-400" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-zinc-950 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Template
                        </span>
                    </div>
                )}
            </div>
            <p className="text-xs text-zinc-400 line-clamp-2 flex-grow">
                {item.prompt}
            </p>
            <div className="flex items-center justify-end gap-1 mt-auto pt-2 border-t border-zinc-700/50">
                <button
                    onClick={onUse}
                    className="px-2 py-0.5 text-xs font-medium text-zinc-200 bg-zinc-600 rounded-md hover:bg-zinc-500 transition-colors"
                >
                    Use
                </button>
                <button
                    onClick={handleCopy}
                    className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-600 transition-colors"
                    aria-label="Copy prompt"
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 text-red-400 hover:text-white rounded-md hover:bg-red-500/50 transition-colors"
                    aria-label="Delete prompt"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export const HistoryPanel = React.memo<HistoryPanelProps>(({ isOpen, onClose, prompts, onUse, onDelete, onImport }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az'>('newest');
    const importInputRef = useRef<HTMLInputElement>(null);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImport(file);
            if(importInputRef.current) {
                importInputRef.current.value = "";
            }
        }
    };

    const handleExport = (format: 'json' | 'md' | 'txt') => {
        switch(format) {
            case 'json':
                exportPromptHistory(prompts);
                break;
            case 'md':
                exportPromptsAsMarkdown(prompts);
                break;
            case 'txt':
                exportPromptsAsText(prompts);
                break;
        }
        setIsExportMenuOpen(false);
    };

    const groupedPrompts = useMemo(() => {
        const lowercasedTerm = debouncedSearchTerm.toLowerCase();
        const filtered = prompts.filter(p => 
            p.title.toLowerCase().includes(lowercasedTerm) || 
            p.prompt.toLowerCase().includes(lowercasedTerm)
        );

        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'az':
                    return a.title.localeCompare(b.title);
                case 'newest':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        return sorted.reduce((acc, prompt) => {
            const category = prompt.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(prompt);
            return acc;
        }, {} as Record<string, SavedPrompt[]>);
    }, [prompts, debouncedSearchTerm, sortBy]);

    const categories = Object.keys(groupedPrompts).sort((a,b) => a.localeCompare(b));
    
    return (
        <div 
            className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'bg-black/60' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <aside 
                className={`fixed top-0 right-0 h-full w-full max-w-lg bg-zinc-900/95 backdrop-blur-sm shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    <header className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0">
                        <h2 className="text-lg font-semibold text-zinc-100">Saved Prompts</h2>
                        <div className="flex items-center gap-2">
                             <button onClick={handleImportClick} className="p-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors" aria-label="Import prompts"><UploadIcon /></button>
                             <input type="file" ref={importInputRef} onChange={handleFileChange} accept=".json,.md,.txt" className="hidden" />
                            
                             <div className="relative" ref={exportMenuRef}>
                                <button
                                    onClick={() => setIsExportMenuOpen(prev => !prev)}
                                    disabled={prompts.length === 0}
                                    className="p-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Export prompts"
                                    aria-haspopup="true"
                                    aria-expanded={isExportMenuOpen}
                                >
                                    <DownloadIcon />
                                </button>
                                {isExportMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 origin-top-right bg-zinc-900/90 backdrop-blur-sm divide-y divide-zinc-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                                        <div className="py-1">
                                            <button onClick={() => handleExport('json')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700">Export as JSON (.json)</button>
                                            <button onClick={() => handleExport('md')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700">Export as Markdown (.md)</button>
                                            <button onClick={() => handleExport('txt')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700">Export as Text (.txt)</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                             <button onClick={onClose} className="p-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors" aria-label="Close history panel"><XMarkIcon /></button>
                        </div>
                    </header>

                    <div className="p-4 border-b border-zinc-800 flex-shrink-0">
                      <div className="flex flex-col sm:flex-row gap-2">
                         <input
                            type="search"
                            placeholder="Search prompts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                         />
                         <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="w-full sm:w-auto bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs">
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="az">A-Z</option>
                         </select>
                       </div>
                    </div>
                    
                    <div className="flex-grow p-4 overflow-y-auto">
                        {prompts.length > 0 && categories.length > 0 ? (
                           <div className="flex flex-col gap-6">
                               {categories.map(category => (
                                   <section key={category}>
                                       <h3 className="text-sm font-semibold uppercase text-zinc-400 tracking-wider pb-2 mb-2 border-b border-zinc-800">{category}</h3>
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                           {groupedPrompts[category].map((p) => (
                                               <HistoryItem 
                                                   key={p.id}
                                                   item={p}
                                                   onUse={() => onUse(p)}
                                                   onDelete={() => onDelete(p.id)}
                                               />
                                           ))}
                                       </div>
                                   </section>
                               ))}
                           </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-zinc-500">
                                <p>{prompts.length === 0 ? "Your saved prompts will appear here." : "No prompts match your search."}</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    );
});