
import React, { useState, useMemo, useEffect } from 'react';
import { OptimizationHistoryEntry } from '../services/optimizationHistoryService';
import { TrashIcon, XMarkIcon, RocketLaunchIcon } from './Icons';

interface OptimizationHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: OptimizationHistoryEntry[];
  onUse: (entry: OptimizationHistoryEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

const HistoryEntryItem: React.FC<{
    item: OptimizationHistoryEntry;
    onUse: () => void;
    onDelete: () => void;
}> = ({ item, onUse, onDelete }) => {
    return (
        <div className="bg-zinc-800/80 rounded-lg p-3 flex flex-col gap-2 transition-all hover:bg-zinc-700/70 ring-1 ring-zinc-700/50">
            <div className="flex justify-between items-start gap-2">
                <div className="text-xs text-zinc-400">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{item.mode}</div>
            </div>
            <p className="text-xs font-medium text-zinc-200 line-clamp-2">
                <span className="font-medium text-zinc-400">Raw: </span>{item.rawPrompt}
            </p>
            <p className="text-xs text-zinc-400 line-clamp-2">
                 <span className="font-medium text-zinc-400">Optimized: </span>{item.optimizedPrompt}
            </p>
            <div className="flex items-center justify-end gap-1 mt-auto pt-2 border-t border-zinc-700/50">
                <button
                    onClick={onUse}
                    className="px-2 py-0.5 text-xs font-medium text-zinc-200 bg-zinc-600 rounded-md hover:bg-zinc-500 transition-colors"
                >
                    Use
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 text-red-400 hover:text-white rounded-md hover:bg-red-500/50 transition-colors"
                    aria-label="Delete history entry"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export const OptimizationHistoryPanel = React.memo<OptimizationHistoryPanelProps>(({ isOpen, onClose, history, onUse, onDelete, onClear }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    // Debounce search term to avoid performance issues on every keystroke
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const groupedHistory = useMemo(() => {
        const lowercasedTerm = debouncedSearchTerm.toLowerCase();
        const filtered = history.filter(h => 
            h.rawPrompt.toLowerCase().includes(lowercasedTerm) || 
            h.optimizedPrompt.toLowerCase().includes(lowercasedTerm)
        );

        return filtered.reduce((acc, entry) => {
            const date = new Date(entry.createdAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let key: string;
            if (date.toDateString() === today.toDateString()) {
                key = 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                key = 'Yesterday';
            } else {
                key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            }

            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(entry);
            return acc;
        }, {} as Record<string, OptimizationHistoryEntry[]>);
    }, [history, debouncedSearchTerm]);

    const dateKeys = Object.keys(groupedHistory);
    
    return (
        <div 
            className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'bg-black/60' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <aside 
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-zinc-900/95 backdrop-blur-sm shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    <header className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0">
                        <div className="flex items-center gap-3">
                           <RocketLaunchIcon className="w-6 h-6 text-indigo-400"/>
                           <h2 className="text-lg font-semibold text-zinc-100">Optimization History</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors" aria-label="Close history panel"><XMarkIcon /></button>
                    </header>

                    <div className="p-4 border-b border-zinc-800 flex-shrink-0 flex gap-2">
                         <input
                            type="search"
                            placeholder="Search history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                         />
                         {history.length > 0 && (
                            <button
                                onClick={onClear}
                                className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 rounded-md hover:bg-red-500/20 hover:text-red-300 transition-colors whitespace-nowrap"
                            >
                                Clear All
                            </button>
                         )}
                    </div>
                    
                    <div className="flex-grow p-4 overflow-y-auto">
                        {history.length > 0 && dateKeys.length > 0 ? (
                           <div className="flex flex-col gap-6">
                               {dateKeys.map(dateKey => (
                                   <section key={dateKey}>
                                       <h3 className="text-sm font-semibold uppercase text-zinc-400 tracking-wider pb-2 mb-3 border-b border-zinc-800">{dateKey}</h3>
                                       <div className="flex flex-col gap-3">
                                           {groupedHistory[dateKey].map((entry) => (
                                               <HistoryEntryItem 
                                                   key={entry.id}
                                                   item={entry}
                                                   onUse={() => onUse(entry)}
                                                   onDelete={() => onDelete(entry.id)}
                                               />
                                           ))}
                                       </div>
                                   </section>
                               ))}
                           </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-zinc-500">
                                <p>{history.length === 0 ? "Your optimization history will appear here." : "No history entries match your search."}</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    );
});