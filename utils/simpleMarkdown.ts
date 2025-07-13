import React from 'react';

// Simple markdown parser for basic formatting in tooltips
// Supports **bold** and basic text only
export function parseSimpleMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  
  // Find all **bold** patterns
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the bold part
    if (match.index > currentIndex) {
      parts.push(text.slice(currentIndex, match.index));
    }
    
    // Add the bold part
    parts.push(React.createElement('strong', { 
      key: `bold-${match.index}`,
      className: 'text-indigo-400' 
    }, match[1]));
    
    currentIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }
  
  return parts;
}
