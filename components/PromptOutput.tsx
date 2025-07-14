
import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { stripMarkdown } from '../utils/promptUtils';
import { tokenizerService } from '../services/tokenizerService';
import { CopyIcon, CheckIcon, BookmarkIcon, LogoIcon, ChevronRightIcon, PencilSquareIcon, DownloadIcon, DocumentTextIcon, ArrowPathIcon, ExclamationTriangleIcon, EllipsisVerticalIcon } from './Icons';
import { Loader } from './Loader';
import MarkdownRenderer from './MarkdownRenderer.tsx';


// --- Sub-components ---

const ErrorDisplay: React.FC<{ message: string, onDismiss: () => void }> = ({ message, onDismiss }) => (
    <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-lg m-2">
      <div className="flex items-start">
        <ExclamationTriangleIcon className="h-5 w-5 mr-3 mt-0.5 text-red-400 flex-shrink-0" />
        <div className="flex-grow">
          <h3 className="font-semibold">An error occurred</h3>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="ml-4 px-2 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-md"
        >
          Dismiss
        </button>
      </div>
    </div>
);

const SkeletonLoader: React.FC = () => (
    <div className="p-4 w-full h-full overflow-hidden">
        <div className="relative animate-[shimmer_1.5s_infinite]">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-zinc-900 via-zinc-800/50 to-zinc-900"></div>
            <div className="space-y-4">
                <div className="h-5 bg-zinc-800 rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
                </div>
                <div className="pt-4 space-y-2">
                  <div className="h-5 bg-zinc-800 rounded w-1/4"></div>
                  <div className="h-4 bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-800 rounded w-4/6"></div>
                </div>
            </div>
        </div>
    </div>
);

const EmptyState: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
        <div className="mb-4 text-fuchsia-500">
            <LogoIcon />
        </div>
        <h3 className="text-xl font-semibold text-zinc-200">Unlock Your AI's Potential</h3>
        <p className="max-w-sm text-zinc-400">
            Start by writing a prompt on the left, choose your settings, then click 'Optimize Prompt' to see the magic happen.
        </p>
    </div>
);

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <details className="group" open>
      <summary className="flex items-center gap-2 cursor-pointer list-none p-2 rounded-md hover:bg-zinc-800/50">
        <ChevronRightIcon className="w-4 h-4 text-zinc-500 transition-transform group-open:rotate-90" />
        <span className="font-semibold text-zinc-200">{title}</span>
      </summary>
      <div className="pl-6 pt-1 pb-2 border-l border-zinc-800 ml-2 prose prose-sm prose-invert max-w-none">
        {children}
      </div>
    </details>
  );
};

const MoreOptionsMenu: React.FC<{
  prompt: string;
  copiedText: boolean;
  onRegenerate: () => void;
  onExportMarkdown: () => void;
  onCopyAsText: () => void;
}> = ({ prompt, copiedText, onRegenerate, onExportMarkdown, onCopyAsText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return; // Only add listener if menu is open

    const handleOutsideClick = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]); // Re-run effect when isOpen changes

  const menuItems = [
    { label: 'Regenerate', icon: ArrowPathIcon, action: onRegenerate },
    { label: 'Export .md', icon: DownloadIcon, action: onExportMarkdown },
    { label: copiedText ? 'Copied Text!' : 'Copy as Text', icon: copiedText ? CheckIcon : DocumentTextIcon, action: onCopyAsText, color: copiedText ? 'text-green-400' : '' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 w-9 h-9 flex items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700">
        <EllipsisVerticalIcon className="w-5 h-5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-zinc-900/90 backdrop-blur-sm divide-y divide-zinc-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            {menuItems.map(({ label, icon: Icon, action, color }) => (
              <button
                key={label}
                onClick={() => { action(); setIsOpen(false); }}
                disabled={!prompt}
                className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm transition-colors disabled:opacity-50 ${color || 'text-zinc-200'} enabled:hover:bg-zinc-700`}
              >
                <Icon className={`w-5 h-5 ${color || 'text-zinc-400'}`} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


// --- Main PromptOutput Component ---
interface PromptOutputProps {
  prompt: string;
  isLoading: boolean;
  onSave: () => void;
  isSaving: boolean;
  onRefine: (prompt: string) => void;
  onRegenerate: () => void;
  error: string | null;
  onErrorDismiss: () => void;
}

export const PromptOutput: React.FC<PromptOutputProps> = React.memo(({ 
  prompt, isLoading, onSave, isSaving, 
  onRefine, onRegenerate,
  error, onErrorDismiss 
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [promptStats, setPromptStats] = useState({ words: 0, chars: 0, tokens: null as number | null });

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    if (copiedText) {
      const timer = setTimeout(() => setCopiedText(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedText]);
  
  // Performance: Only calculate stats when loading is finished to avoid lag during streaming.
  useEffect(() => {
      let isMounted = true;
      if (!isLoading && prompt) {
        const words = prompt.trim().split(/\s+/).filter(Boolean).length;
        const chars = prompt.length;
        // Reset tokens to null while the async calculation is in flight
        setPromptStats(s => ({...s, words, chars, tokens: null}));

        tokenizerService.calculateTokens(prompt).then(tokens => {
          if (isMounted) {
            setPromptStats(s => ({...s, tokens}));
          }
        }).catch(err => {
            console.error("Token calculation for output failed:", err);
             if (isMounted) {
                // Keep showing '--' on error
                setPromptStats(s => ({...s, tokens: null}));
             }
        })
      }
      
      if (!prompt) {
         setPromptStats({ words: 0, chars: 0, tokens: 0 });
      }
      
      return () => { isMounted = false; };
  }, [prompt, isLoading]);

  const handleCopy = async () => {
    if (prompt) {
      try {
        await navigator.clipboard.writeText(prompt);
        setCopied(true);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        // Fallback: try using the legacy method
        try {
          const textArea = document.createElement('textarea');
          textArea.value = prompt;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
        } catch (fallbackError) {
          console.error('Fallback copy method also failed:', fallbackError);
          // Don't set copied to true if both methods fail
        }
      }
    }
  };

  const handleCopyAsText = async () => {
    if (prompt) {
      try {
        const plainText = stripMarkdown(prompt);
        await navigator.clipboard.writeText(plainText);
        setCopiedText(true);
      } catch (error) {
        console.error('Failed to copy text to clipboard:', error);
        // Fallback: try using the legacy method
        try {
          const plainText = stripMarkdown(prompt);
          const textArea = document.createElement('textarea');
          textArea.value = plainText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopiedText(true);
        } catch (fallbackError) {
          console.error('Fallback copy method also failed:', fallbackError);
          // Don't set copiedText to true if both methods fail
        }
      }
    }
  };

  const handleExportMarkdown = () => {
    if (!prompt) return;
    const blob = new Blob([prompt], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `prompt-optimizer-${Date.now()}.md`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const saveButtonTooltip = isSaving ? 'Saving...' : 'Save prompt';
  
  const promptSections = useMemo(() => {
    if (!prompt) return [];
    const sections = prompt.split(/\n(?=\*\*[\w\s&]+:\*\*)/);
    const result: { title: string; content: string }[] = [];
    const firstSectionContent = sections.length > 0 ? sections[0].trim() : '';
    
    if (firstSectionContent && !firstSectionContent.startsWith('**')) {
        sections.shift();
        if (firstSectionContent) {
            result.push({ title: 'Introduction', content: firstSectionContent });
        }
    }
    for (const section of sections) {
        const parts = section.split(/:\*\*\s*\n/);
        if (parts.length > 1) {
            const title = parts[0].replace(/\*\*|\n/g, '').trim();
            const content = parts.slice(1).join(':**\n').trim();
            if (title && content) {
                result.push({ title, content });
            }
        } else if (section.trim()) {
            // Fallback for content that doesn't match the title structure
            const existingContent = result.find(r => r.title === 'Content');
            if(existingContent) {
                existingContent.content += '\n' + section.trim();
            } else {
                 result.push({ title: 'Content', content: section.trim() });
            }
        }
    }
    return result;
  }, [prompt]);

  const renderContent = () => {
    if (isLoading && !prompt) return <SkeletonLoader />;
    if (error) return <ErrorDisplay message={error} onDismiss={onErrorDismiss} />;
    if (!prompt && !isLoading) return <EmptyState />;

    // Always render with collapsible sections to prevent layout shift.
    return (
      <div className="p-2 space-y-1">
        <Suspense fallback={<SkeletonLoader />}>
            {promptSections.map((section, index) => (
              <CollapsibleSection key={index} title={section.title}>
                <MarkdownRenderer content={
                    isLoading && index === promptSections.length - 1 
                      ? section.content + '▌'
                      : section.content
                } />
              </CollapsibleSection>
            ))}
        </Suspense>
      </div>
    );
  };
  
  return (
    <div className="relative flex flex-col h-full bg-zinc-900 rounded-xl shadow-2xl ring-1 ring-zinc-800">
      <div className="flex-shrink-0 flex justify-between items-center bg-zinc-800/80 px-4 py-2 rounded-t-xl">
        <h2 className="text-base font-semibold text-zinc-200">Optimized Prompt</h2>
        <div className="flex items-center gap-1">
            <button
              onClick={onSave}
              disabled={!prompt || isLoading || isSaving}
              className="p-2 w-9 h-9 flex items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed group relative text-zinc-400 enabled:hover:text-white enabled:hover:bg-zinc-700"
              aria-label={saveButtonTooltip}
            >
              {isSaving ? <Loader /> : <BookmarkIcon className="w-5 h-5" />}
               <span className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-zinc-950 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {saveButtonTooltip}
              </span>
            </button>
            <button
              onClick={() => onRefine(prompt)}
              disabled={!prompt || isLoading || isSaving}
              className="p-2 w-9 h-9 flex items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed group relative text-zinc-400 enabled:hover:text-white enabled:hover:bg-zinc-700"
              aria-label="Refine this prompt"
            >
              <PencilSquareIcon className="w-5 h-5" />
              <span className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-zinc-950 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Refine
              </span>
            </button>
            <button
              onClick={handleCopy}
              disabled={!prompt || copied || isLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md text-white bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            
            <div className="w-px h-5 bg-zinc-700 mx-1"></div>
            
            <MoreOptionsMenu 
              prompt={prompt}
              copiedText={copiedText}
              onRegenerate={onRegenerate}
              onExportMarkdown={handleExportMarkdown}
              onCopyAsText={handleCopyAsText}
            />
        </div>
      </div>
      <div className="flex-grow p-1 overflow-auto min-h-[150px] no-scrollbar">
        {renderContent()}
      </div>
       {prompt && !isLoading && !error && (
         <div className="flex-shrink-0 border-t border-zinc-800 px-4 py-1.5 text-xs text-zinc-500 text-right space-x-2">
             <span>{promptStats.tokens === null ? '--' : promptStats.tokens} tokens</span>
             <span className="text-zinc-600">/</span>
             <span>{promptStats.words} words</span>
             <span className="text-zinc-600">/</span>
             <span>{promptStats.chars} characters</span>
         </div>
       )}
    </div>
  );
});