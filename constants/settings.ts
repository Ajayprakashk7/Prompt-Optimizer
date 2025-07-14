
import type { SettingOption } from '../types/prompt';

export const PROMPT_MODES: SettingOption[] = [
    {
        value: 'Lite',
        label: 'Lite',
        description: `**Quick & Direct**\nConcise instruction ready to use.\n**Example:** "Act as a Python expert and refactor this code for readability."`
    },
    {
        value: 'Pro',
        label: 'Pro',
        description: `**Balanced & Professional**\nStructured with Persona, Goal, Context, and Instructions.\n**Best for:** Most use cases`
    },
    {
        value: 'Architect',
        label: 'Architect',
        description: `**Comprehensive & Detailed**\nExhaustive specification with constraints, variables, and formatting.\n**Best for:** Complex tasks`
    }
];
