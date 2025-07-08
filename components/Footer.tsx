import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="text-center py-0 mt-1">
      <p className="text-xs text-slate-500">
        Created by{' '}
        <a 
          href="https://ajayprakash.dev" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-medium text-slate-400 hover:text-indigo-400 transition-colors"
        >
          Ajay Prakash
        </a>
      </p>
    </footer>
  );
};
