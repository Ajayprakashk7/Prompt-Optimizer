
export const interpolateVariables = (prompt: string, variables: Record<string, string>): string => {
  let result = prompt;
  if (!variables) return result;
  
  for (const key in variables) {
    if (variables[key]) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
    }
  }
  return result;
};

export const stripMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  
  return markdown
    // Replace ```...``` code blocks with their content first, to preserve its content
    .replace(/```[a-zA-Z]*\s*\n([\s\S]*?)\n?\s*```/g, '$1')
    // Remove bold and italics, keeping the text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove headers, keeping the text
    .replace(/^#+\s/gm, '')
    // Remove list markers, keeping the text
    .replace(/^\s*[-*+]\s/gm, '')
    .replace(/^\s*\d+\.\s/gm, '')
    // Remove horizontal rules
    .replace(/^-{3,}\s*$/gm, '')
    // Remove inline code backticks
    .replace(/`([^`]+)`/g, '$1')
    // Clean up extra newlines that might result from removals
    .replace(/\n{2,}/g, '\n\n')
    .trim();
};
