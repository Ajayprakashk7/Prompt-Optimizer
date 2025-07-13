

import React, { useMemo, useEffect, useState } from 'react';
import { VariableIcon } from './Icons';

interface VariableEditorProps {
    promptText: string;
    variables: Record<string, string>;
    onVariablesChange: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
}

export const VariableEditor: React.FC<VariableEditorProps> = React.memo(({ promptText, variables, onVariablesChange }) => {
    // By debouncing the prompt text internally, we prevent the expensive regex matching and
    // state synchronization logic from running on every single keystroke. This significantly
    // improves performance while the user is typing in the main input area.
    const [debouncedPromptText, setDebouncedPromptText] = useState(promptText);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedPromptText(promptText);
        }, 300); // 300ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [promptText]);


    const detectedVars = useMemo(() => {
        const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
        // The regex now runs on the debounced text, not on every prop change.
        const matches = debouncedPromptText.match(regex) || [];
        return [...new Set(matches.map(v => v.replace(/[{}]/g, '')))];
    }, [debouncedPromptText]);

    // This effect synchronizes the variable state. Because it depends on `detectedVars`,
    // which in turn depends on the debounced text, this logic now only runs after the
    // user has paused typing, avoiding unnecessary state updates.
    useEffect(() => {
        const detectedVarSet = new Set(detectedVars);
        
        onVariablesChange(currentVars => {
            const newVarsState: Record<string, string> = {};
            let hasChanged = false;

            // Build the new state from detected variables
            for (const key of detectedVarSet) {
                newVarsState[key] = currentVars[key] || '';
            }

            // Check if the keys are different from the current state
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

            // Only update state if the set of variables has actually changed.
            return hasChanged ? newVarsState : currentVars;
        });
    }, [detectedVars, onVariablesChange]);

    if (detectedVars.length === 0) {
        return null;
    }

    const handleInputChange = (varName: string, value: string) => {
        onVariablesChange(currentVars => ({
            ...currentVars,
            [varName]: value,
        }));
    };

    return (
        <div className="bg-zinc-950/50 rounded-lg p-4 mt-4">
            <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-200 mb-3">
                <VariableIcon />
                Define Prompt Variables
            </h3>
            <div className="space-y-3">
                {detectedVars.map(varName => (
                    <div key={varName} className="flex flex-col gap-1.5">
                        <label htmlFor={`var-${varName}`} className="text-xs font-medium text-zinc-300">
                            {varName}
                        </label>
                        <input
                            id={`var-${varName}`}
                            type="text"
                            value={variables[varName] || ''}
                            onChange={(e) => handleInputChange(varName, e.target.value)}
                            placeholder={`Enter value for ${varName}...`}
                            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
});
