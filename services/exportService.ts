
import type { SavedPrompt } from './historyService';

// --- UTILITY ---

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


// --- EXPORT FUNCTIONS ---

export const exportPromptHistory = (prompts: SavedPrompt[]): void => {
  if (!prompts || prompts.length === 0) {
      alert("No saved prompts to export.");
      return;
  }
  const dataStr = JSON.stringify(prompts, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  downloadFile(dataBlob, `prompt-optimizer-backup-${new Date().toISOString().split('T')[0]}.json`);
};

export const exportPromptsAsMarkdown = (prompts: SavedPrompt[]): void => {
  if (!prompts || prompts.length === 0) {
    alert("No saved prompts to export.");
    return;
  }
  let markdownContent = `# Prompt Optimizer Export\n\nExported on: ${new Date().toLocaleString()}\n\n`;
  prompts.forEach(p => {
    markdownContent += `
---

## ${p.title}

- **Category:** ${p.category}
- **Created:** ${new Date(p.createdAt).toLocaleString()}
- **Variables:** \`${Object.keys(p.variables || {}).join(', ') || 'None'}\`

### Prompt Template
\`\`\`
${p.prompt}
\`\`\`
${p.optimizedPrompt ? `
### Optimized Prompt
\`\`\`markdown
${p.optimizedPrompt}
\`\`\`
` : ''}
`;
  });

  const dataBlob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
  downloadFile(dataBlob, `prompt-optimizer-export-${new Date().toISOString().split('T')[0]}.md`);
};

export const exportPromptsAsText = (prompts: SavedPrompt[]): void => {
    if (!prompts || prompts.length === 0) {
        alert("No saved prompts to export.");
        return;
    }
    let textContent = `Prompt Optimizer Export\nExported on: ${new Date().toLocaleString()}\n\n`;
    prompts.forEach(p => {
        textContent += `
==================================================
Title: ${p.title}
Category: ${p.category}
Created: ${new Date(p.createdAt).toLocaleString()}
Variables: ${Object.keys(p.variables || {}).join(', ') || 'None'}
--------------------------------------------------
PROMPT TEMPLATE:
${p.prompt}
${p.optimizedPrompt ? `
--------------------------------------------------
OPTIMIZED PROMPT:
${p.optimizedPrompt}` : ''}
==================================================\n\n`;
    });

    const dataBlob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    downloadFile(dataBlob, `prompt-optimizer-export-${new Date().toISOString().split('T')[0]}.txt`);
};


// --- IMPORT FUNCTION ---

export const importPromptHistory = (file: File): Promise<SavedPrompt[]> => {
    return new Promise((resolve, reject) => {
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
        if (file.size > MAX_FILE_SIZE) {
            return reject(new Error(`File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum size is 5 MB.`));
        }

        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                if (!event.target?.result) {
                    throw new Error("File could not be read.");
                }
                const content = event.target.result as string;
                const fileType = file.name.split('.').pop()?.toLowerCase();

                if (fileType === 'json') {
                    const parsedData = JSON.parse(content);
                    if (!Array.isArray(parsedData)) {
                        throw new Error("Invalid JSON format: expecting an array of prompts.");
                    }
                    const importedPrompts: SavedPrompt[] = parsedData.map((p: any) => {
                        if (!p || typeof p.id !== 'string' || typeof p.prompt !== 'string' || typeof p.title !== 'string' || typeof p.createdAt !== 'string') {
                            console.warn('Skipping invalid prompt object during import:', p);
                            return null;
                        }
                        const newPrompt: SavedPrompt = {
                            id: p.id,
                            prompt: p.prompt,
                            title: p.title,
                            category: typeof p.category === 'string' ? p.category : 'Imported',
                            createdAt: p.createdAt,
                            variables: typeof p.variables === 'object' && p.variables !== null ? p.variables : {},
                        };
                        if (typeof p.optimizedPrompt === 'string') {
                            newPrompt.optimizedPrompt = p.optimizedPrompt;
                        }
                        return newPrompt;
                    }).filter((p): p is SavedPrompt => p !== null);
                    resolve(importedPrompts);

                } else if (fileType === 'md') {
                    const prompts: SavedPrompt[] = [];
                    // Split by the horizontal rule used as a separator
                    const segments = content.split(/^\s*---\s*$/m);

                    for (const segment of segments) {
                        if (segment.trim() === '' || segment.includes("# Prompt Optimizer Export")) continue;

                        const titleMatch = segment.match(/## (.*)/);
                        const categoryMatch = segment.match(/- \*\*Category:\*\* (.*)/);
                        const promptMatch = segment.match(/### Prompt Template\s*\n```\s*([\s\S]*?)\n?\s*```/);
                        const optimizedMatch = segment.match(/### Optimized Prompt\s*\n```markdown\s*([\s\S]*?)\n?\s*```/);

                        if (titleMatch && categoryMatch && promptMatch) {
                            prompts.push({
                                id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${prompts.length}`,
                                title: titleMatch[1].trim(),
                                category: categoryMatch[1].trim(),
                                prompt: promptMatch[1].trim(),
                                optimizedPrompt: optimizedMatch ? optimizedMatch[1].trim() : undefined,
                                createdAt: new Date().toISOString(),
                                variables: {}, // Re-detecting variables is better than parsing them back.
                            });
                        }
                    }

                    if (prompts.length > 0) {
                        resolve(prompts);
                    } else {
                        // Fallback for a generic markdown file
                        resolve([{
                            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                            title: file.name.replace(/\.md$/i, ''),
                            prompt: content,
                            category: 'Imported',
                            createdAt: new Date().toISOString(),
                            variables: {},
                        }]);
                    }
                } else if (fileType === 'txt') {
                    const prompts: SavedPrompt[] = [];
                    // Split by the long separator line
                    const segments = content.split('==================================================');

                    for (const segment of segments) {
                        if (segment.trim() === '' || segment.includes("Prompt Optimizer Export")) continue;
                        
                        const titleMatch = segment.match(/Title: (.*)/);
                        const categoryMatch = segment.match(/Category: (.*)/);
                        const templateMatch = segment.match(/PROMPT TEMPLATE:\s*([\s\S]*?)(?:\s*--------------------------------------------------|$)/);
                        const optimizedMatch = segment.match(/OPTIMIZED PROMPT:\s*([\s\S]*)/);


                        if (titleMatch && categoryMatch && templateMatch) {
                            prompts.push({
                                id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${prompts.length}`,
                                title: titleMatch[1].trim(),
                                category: categoryMatch[1].trim(),
                                prompt: templateMatch[1].trim(),
                                optimizedPrompt: optimizedMatch ? optimizedMatch[1].trim() : undefined,
                                createdAt: new Date().toISOString(),
                                variables: {},
                            });
                        }
                    }

                    if (prompts.length > 0) {
                        resolve(prompts);
                    } else {
                         // Fallback for a generic text file
                        resolve([{
                            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                            title: file.name.replace(/\.txt$/i, ''),
                            prompt: content,
                            category: 'Imported',
                            createdAt: new Date().toISOString(),
                            variables: {},
                        }]);
                    }
                } else {
                    throw new Error(`Unsupported file type: .${fileType}`);
                }
            } catch (e) {
                reject(e);
            }
        };
        
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};
