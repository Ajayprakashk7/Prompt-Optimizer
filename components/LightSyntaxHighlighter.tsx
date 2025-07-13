import React, { useEffect, useRef } from 'react';

// Only import core highlight.js and specific languages we need
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';

// Register only the languages we commonly use
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);

interface LightSyntaxHighlighterProps {
  children: string;
  language: string;
  className?: string;
}

const LightSyntaxHighlighter: React.FC<LightSyntaxHighlighterProps> = ({ 
  children, 
  language, 
  className = '' 
}) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      // Clear any existing highlighting
      codeRef.current.removeAttribute('data-highlighted');
      
      // Apply highlighting if language is supported
      if (hljs.getLanguage(language)) {
        hljs.highlightElement(codeRef.current);
      }
    }
  }, [children, language]);

  return (
    <pre className={`hljs bg-zinc-800 p-3 rounded-md overflow-x-auto text-sm ${className}`}>
      <code ref={codeRef} className={`language-${language}`}>
        {children}
      </code>
    </pre>
  );
};

export default LightSyntaxHighlighter;
