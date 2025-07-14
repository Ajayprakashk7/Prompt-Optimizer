import React from 'react';

// Enhanced markdown parser for tooltips
// Supports **bold**, line breaks, and basic formatting
export function parseSimpleMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];

  // Split by lines first to handle line breaks
  const lines = text.split('\n');

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      // Add line break between lines
      parts.push(React.createElement('br', { key: `br-${lineIndex}` }));
    }

    let currentIndex = 0;

    // Find all **bold** patterns in this line
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      // Add text before the bold part
      if (match.index > currentIndex) {
        const textBefore = line.slice(currentIndex, match.index);
        if (textBefore) {
          parts.push(textBefore);
        }
      }

      // Add the bold part
      parts.push(React.createElement('strong', {
        key: `bold-${lineIndex}-${match.index}`,
        className: 'text-indigo-400 font-semibold'
      }, match[1]));

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text in this line
    if (currentIndex < line.length) {
      const remainingText = line.slice(currentIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }
  });

  return parts;
}
