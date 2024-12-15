import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type CustomMarkdownProps = {
  content: string;
};

export default function CustomMarkdown({ content }: CustomMarkdownProps) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
