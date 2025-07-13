import React from 'react';

export const Footer = React.memo(() => {
  return (
    <footer className="text-center py-3 flex-shrink-0">
      <p className="text-xs text-zinc-600">
        Created by{' '}
        <a 
          href="https://ajayprakash.dev" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-medium text-zinc-500 hover:text-indigo-400 transition-colors"
        >
          Ajay Prakash
        </a>
      </p>
    </footer>
  );
});