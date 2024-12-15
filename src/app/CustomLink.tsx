import { useState } from 'react';

type CustomLinkProps = {
  defaultText?: string;
  defaultUrl?: string;
};

export default function CustomLink({ defaultText = 'Click here', defaultUrl = '' }: CustomLinkProps) {
  const [displayText, setDisplayText] = useState(defaultText);
  const [url, setUrl] = useState(defaultUrl);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="custom-link">
      {isEditing ? (
        <div className="editor">
          <input
            type="text"
            value={displayText}
            onChange={(e) => setDisplayText(e.target.value)}
            placeholder="Display text"
            className="rounded border border-gray-300 p-2 mr-2"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL"
            className="rounded border border-gray-300 p-2"
          />
          <button onClick={handleSave} className="bg-blue-500 text-white px-3 py-2 rounded ml-2">
            Save
          </button>
        </div>
      ) : (
        <a
          href={url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
          onClick={(e) => {
            if (!url) e.preventDefault(); // Prevent navigation if no URL is set
          }}
        >
          {displayText}
        </a>
      )}
      <button
        onClick={() => setIsEditing(true)}
        className="ml-2 text-gray-500 underline hover:text-blue-500"
      >
        Edit
      </button>
    </div>
  );
}
