import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
// Import a few common languages for syntax highlighting
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';

// Register languages
SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('js', js);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('md', markdown);

// Import custom theme styles
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline || !match) {
    return (
      <code className="px-1.5 py-0.5 rounded font-mono text-[13.5px] bg-black/5 dark:bg-white/10 text-accent dark:text-[#F6E05E]" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-soft">
      <div className="px-4 py-1.5 text-xs flex justify-between items-center select-none font-mono bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/55">
        <span>{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-accent rounded px-1"
          aria-label="Copy code block"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="w-full overflow-x-auto bg-slate-900">
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={lang}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '13.5px',
            lineHeight: '1.6',
          }}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export const MarkdownRenderer = ({ content }) => {
  return (
    <div className="markdown-content text-left space-y-3 leading-relaxed text-[15px] select-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          h1: ({ children }) => <h1 className="text-2xl font-bold font-heading mt-6 mb-3 text-current">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold font-heading mt-5 mb-2 text-current">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold font-heading mt-4 mb-2 text-current">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-semibold font-heading mt-3 mb-1 text-current">{children}</h4>,
          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1.5">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="pl-4 border-l-4 border-accent/40 dark:border-white/20 my-4 italic text-black/70 dark:text-white/70">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-t border-black/10 dark:border-white/10" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline break-words transition-all font-medium inline-flex items-center gap-0.5"
            >
              {children}
              <svg className="inline" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
              <table className="min-w-full divide-y divide-black/10 dark:divide-white/10 text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-black/5 dark:bg-white/5">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-black/5 dark:divide-white/5">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-4 py-2 text-left font-semibold text-black/80 dark:text-white/80">{children}</th>,
          td: ({ children }) => <td className="px-4 py-2 text-left">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
