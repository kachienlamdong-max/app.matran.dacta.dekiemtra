import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Render text containing LaTeX expressions ($...$ or $$...$$)
  const renderFormattedText = (text: string) => {
    // Regex for $$...$$ (display mode) or $...$ (inline mode) or \(...\) or \[...\]
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$|\\\[[\s\S]*?\\\]|\\\([^\n]+?\\\))/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Check for display math $$...$$ or \[...\]
      if (
        (part.startsWith('$$') && part.endsWith('$$')) ||
        (part.startsWith('\\[') && part.endsWith('\\]'))
      ) {
        const math = part.startsWith('$$')
          ? part.slice(2, -2).trim()
          : part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
            output: 'htmlAndMathml',
          });
          return (
            <span
              key={index}
              className="block my-2 overflow-x-auto py-1 text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return <span key={index} className="font-mono text-red-600">{part}</span>;
        }
      }

      // Check for inline math $...$ or \(...\)
      if (
        (part.startsWith('$') && part.endsWith('$') && part.length > 2) ||
        (part.startsWith('\\(') && part.endsWith('\\)'))
      ) {
        const math = part.startsWith('$')
          ? part.slice(1, -1).trim()
          : part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
            output: 'htmlAndMathml',
          });
          return (
            <span
              key={index}
              className="inline-math px-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return <span key={index} className="font-mono text-red-600">{part}</span>;
        }
      }

      // Plain text - convert newlines to <br/> if any
      const lines = part.split('\n');
      return (
        <React.Fragment key={index}>
          {lines.map((line, lIdx) => (
            <React.Fragment key={lIdx}>
              {lIdx > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    });
  };

  return <div className={`prose-sm leading-relaxed ${className}`}>{renderFormattedText(content)}</div>;
};
