
import React, { Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import LightSyntaxHighlighter from './LightSyntaxHighlighter';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(({ content }) => (
  <Suspense fallback={<div className="animate-pulse bg-zinc-800 h-4 rounded"></div>}>
    <MarkdownContent content={content} />
  </Suspense>
));

const MarkdownContent: React.FC<MarkdownRendererProps> = React.memo(({ content }) => {
  const [remarkGfmPlugin, setRemarkGfmPlugin] = React.useState<any>(null);

  React.useEffect(() => {
    // Dynamically load remarkGfm only when needed
    import('remark-gfm').then(module => {
      setRemarkGfmPlugin(() => module.default);
    }).catch(() => {
      // Fallback if remark-gfm fails to load
      setRemarkGfmPlugin(null);
    });
  }, []);

  return (
    <div className="text-sm leading-relaxed text-high-contrast" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.7' }}>
      <ReactMarkdown
        remarkPlugins={remarkGfmPlugin ? [remarkGfmPlugin] : []}
        components={{
          // Enhanced paragraph styling for better readability
          p({ children }) {
            return <p className="leading-relaxed mb-3 text-high-contrast" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.7' }}>{children}</p>;
          },
          // Enhanced heading styles with better hierarchy
          h1({ children }) {
            return <h1 className="font-bold mb-3 text-high-contrast" style={{ fontSize: 'var(--text-lg)', lineHeight: '1.5' }}>{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="font-bold mb-2 text-high-contrast" style={{ fontSize: 'var(--text-base)', lineHeight: '1.5' }}>{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="font-semibold mb-2 text-high-contrast" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.5' }}>{children}</h3>;
          },
          // Enhanced list styles with better spacing
          ul({ children }) {
            return <ul className="leading-relaxed mb-3 ml-5 list-disc text-high-contrast" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.7' }}>{children}</ul>;
          },
          ol({ children }) {
            return <ol className="leading-relaxed mb-3 ml-5 list-decimal text-high-contrast" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.7' }}>{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed mb-1 text-high-contrast" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.7' }}>{children}</li>;
          },
          // Enhanced blockquote with better contrast
          blockquote({ children }) {
            return <blockquote className="leading-relaxed border-l-4 border-zinc-500 pl-4 italic text-medium-contrast mb-3" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.7' }}>{children}</blockquote>;
          },
          // Keep existing code styling
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <LightSyntaxHighlighter
                language={match[1]}
                children={String(children).replace(/\n$/, '')}
              />
            ) : (
              <code className={`${className} bg-zinc-800 px-1 py-0.5 rounded text-sm`} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

export default MarkdownRenderer;