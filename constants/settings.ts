
import type { SettingOption } from '../types/prompt';

export const PROMPT_MODES: SettingOption[] = [
    {
        value: 'Lite',
        label: 'Lite',
        description: `**Output:** A concise, direct instruction.\n**Example:** "Act as a Python expert and refactor this code for readability."`
    },
    {
        value: 'Pro',
        label: 'Pro',
        description: `**Output:** A balanced, professional prompt.\n**Example:** Defines Persona, Goal, Context, and Instructions.`
    },
    {
        value: 'Architect',
        label: 'Architect',
        description: `**Output:** An exhaustive, detailed specification.\n**Example:** Includes deep context, constraints, variables, and output formatting.`
    }
];
