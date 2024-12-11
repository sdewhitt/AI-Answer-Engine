import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CustomMarkdown = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => (
          <a
            {...props}
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default CustomMarkdown;