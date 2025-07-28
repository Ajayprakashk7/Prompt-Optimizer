

import React, { useMemo, useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon, XMarkIcon, PlusIcon } from './Icons';

interface VariableEditorProps {
    promptText: string;
    variables: Record<string, string>;
    onVariablesChange: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
}

// Common variable suggestions for different contexts
const VARIABLE_SUGGESTIONS = [
    'language', 'framework', 'task_type', 'input_data', 'output_format',
    'context', 'requirements', 'constraints', 'example', 'style'
];

export const VariableEditor: React.FC<VariableEditorProps> = React.memo(({ promptText, variables, onVariablesChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [debouncedPromptText, setDebouncedPromptText] = useState(promptText);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedPromptText(promptText);
        }, 300);
        return () => clearTimeout(handler);
    }, [promptText]);

    const detectedVars = useMemo(() => {
        const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
        const matches = debouncedPromptText.match(regex) || [];
        return [...new Set(matches.map(v => v.replace(/[{}]/g, '')))];
    }, [debouncedPromptText]);

    // Only auto-expand on first detection, not every time
    useEffect(() => {
        if (detectedVars.length > 0 && !isExpanded && Object.keys(variables).length === 0) {
            setIsExpanded(true);
        }
    }, [detectedVars.length, isExpanded, variables]);

    useEffect(() => {
        const detectedVarSet = new Set(detectedVars);

        onVariablesChange(currentVars => {
            const newVarsState: Record<string, string> = {};
            let hasChanged = false;

            for (const key of detectedVarSet) {
                newVarsState[key] = currentVars[key] || '';
            }

            const currentKeys = Object.keys(currentVars);
            if (currentKeys.length !== detectedVarSet.size) {
                hasChanged = true;
            } else {
                for(const key of currentKeys) {
                    if(!detectedVarSet.has(key)) {
                        hasChanged = true;
                        break;
                    }
                }
            }

            return hasChanged ? newVarsState : currentVars;
        });
    }, [detectedVars, onVariablesChange]);

    const handleInputChange = (varName: string, value: string) => {
        onVariablesChange(currentVars => ({
            ...currentVars,
            [varName]: value,
        }));
    };

    const handleRemoveVariable = (varName: string) => {
        onVariablesChange(currentVars => {
            const newVars = { ...currentVars };
            delete newVars[varName];
            return newVars;
        });
    };

    const handleAddSuggestion = (suggestion: string) => {
        onVariablesChange(currentVars => ({
            ...currentVars,
            [suggestion]: ''
        }));
    };

    // Don't render if no variables detected and not manually expanded
    if (detectedVars.length === 0 && !isExpanded) {
        return null;
    }

    const availableSuggestions = VARIABLE_SUGGESTIONS.filter(
        suggestion => !detectedVars.includes(suggestion) && !variables[suggestion]
    );

    return (
        <div className="glass-panel rounded-lg overflow-hidden">
            {/* Collapsible Header - Compact */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-2 hover:glass-hover transition-all text-left"
            >
                <div className="flex items-center gap-1.5">
                    {isExpanded ? (
                        <ChevronDownIcon className="w-3 h-3 text-zinc-400" />
                    ) : (
                        <ChevronRightIcon className="w-3 h-3 text-zinc-400" />
                    )}
                    <span className="text-xs font-medium glass-text">
                        Variables {detectedVars.length > 0 && `(${detectedVars.length})`}
                    </span>
                </div>
                {detectedVars.length > 0 && (
                    <div className="flex gap-1">
                        {detectedVars.slice(0, 2).map(varName => (
                            <span
                                key={varName}
                                className="px-1.5 py-0.5 text-xs glass-highlight text-indigo-300 rounded"
                            >
                                {varName}
                            </span>
                        ))}
                        {detectedVars.length > 2 && (
                            <span className="px-1.5 py-0.5 text-xs glass-highlight text-zinc-400 rounded">
                                +{detectedVars.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </button>

            {/* Expandable Content - Compact & Scrollable */}
            {isExpanded && (
                <div className="max-h-32 overflow-y-auto glass-panel">
                    <div className="p-2 space-y-2">
                        {/* Detected Variables - Inline Layout */}
                        {detectedVars.map(varName => (
                            <div key={varName} className="flex items-center gap-2">
                                <span className="text-xs font-medium text-indigo-300 min-w-0 flex-shrink-0">
                                    {varName}:
                                </span>
                                <input
                                    type="text"
                                    value={variables[varName] || ''}
                                    onChange={(e) => handleInputChange(varName, e.target.value)}
                                    placeholder="value..."
                                    className="flex-1 glass-input text-zinc-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        ))}

                        {/* Manual Variables - Inline Layout */}
                        {Object.entries(variables).filter(([key]) => !detectedVars.includes(key)).map(([varName, value]) => (
                            <div key={varName} className="flex items-center gap-2">
                                <span className="text-xs font-medium text-zinc-300 min-w-0 flex-shrink-0">
                                    {varName}:
                                </span>
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => handleInputChange(varName, e.target.value)}
                                    placeholder="value..."
                                    className="flex-1 glass-input text-zinc-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button
                                    onClick={() => handleRemoveVariable(varName)}
                                    className="p-0.5 text-zinc-400 hover:text-red-400 hover:glass-hover rounded transition-colors flex-shrink-0 glass-card"
                                    title="Remove"
                                >
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        {/* Quick Add Suggestions - Compact */}
                        {availableSuggestions.length > 0 && (detectedVars.length + Object.keys(variables).filter(k => !detectedVars.includes(k)).length) < 3 && (
                            <div className="pt-1 border-t border-zinc-700/50">
                                <div className="flex flex-wrap gap-1">
                                    {availableSuggestions.slice(0, 3).map(suggestion => (
                                        <button
                                            key={suggestion}
                                            onClick={() => handleAddSuggestion(suggestion)}
                                            className="px-1.5 py-0.5 text-xs glass-card text-zinc-400 rounded hover:glass-hover hover:text-zinc-300 transition-colors"
                                        >
                                            +{suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});
