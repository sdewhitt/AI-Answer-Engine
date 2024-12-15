"use client";

import { useState, useEffect } from "react";
import '../../styles.css';
import Link from 'next/link';
import CustomMarkdown from "./CustomMarkdown";
//import CustomLink from "./CustomLink";
import { usePathname, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

type Link = {
  summary: string; // The AI-generated summary
  url: string;     // The corresponding hyperlink
};
type Message = {
  role: "user" | "ai";
  content: string;
  links?: Link[];
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! How can I help you today?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isShareBoxVisible, setIsShareBoxVisible] = useState(true);
  

  const searchParams = useSearchParams();


  useEffect(() => {
    
    const id = searchParams.get('id');
    if (id) {
      fetch(`/api/get-conversation?id=${id}`)
        .then((res) => res.json())
        .then((data) => setMessages(data.conversation || []));
    }
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message to the conversation
    const userMessage = { role: "user" as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }), //body: JSON.stringify({ message }), //
      });

      // Handle the response from the chat API to display the AI response in the UI

      const data = await response.json();

      // Add AI response to the conversation
      const aiMessage: Message = { role: 'ai', content: data.message };
      setMessages((prev) => [...prev, aiMessage]);


    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const conversationId = uuidv4();
    await fetch('/api/save-conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: conversationId, conversation: messages }),
    });
  
    const link = `${window.location.origin}${window.location.pathname}?id=${conversationId}`;
    setShareLink(link);
    setIsShareBoxVisible(true);
  };


  
  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
    setIsShareBoxVisible(false);
  };
  
  //Tailwind CSS docs: https://tailwindcss.com/docs/customizing-colors, https://tailwindcss.com/docs/hover-focus-and-other-states
  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="w-full bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold text-white">ChatSD</h1>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto pb-32 pt-4">
        <div className="max-w-3xl mx-auto px-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-4 mb-4 ${
                msg.role === "ai"
                  ? "justify-start"
                  : "justify-end flex-row-reverse"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                  msg.role === "ai"
                    ? "bg-violet-950 border border-rose-500 text-gray-100"
                    : "bg-slate-800 border border-violet-500 text-white ml-auto"
                } custom-font`}
                //style = {{ borderColor: msg.role === "ai" ? 'rgb(190, 18, 60)' : 'rgb(44, 15, 92)' }}
                //style={{ whiteSpace: 'pre-wrap' }}
              >
                {msg.role === 'ai' ? (
                  <>
                    <CustomMarkdown content={msg.content || "No content available"} />
                    {msg.links && msg.links.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {msg.links.map((link, i) => (
                          <div key={i}>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 underline hover:text-blue-500"
                            >
                              {link.summary}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c.79 0 1.5-.71 1.5-1.5S8.79 9 8 9s-1.5.71-1.5 1.5S7.21 11 8 11zm8 0c.79 0 1.5-.71 1.5-1.5S16.79 9 16 9s-1.5.71-1.5 1.5.71 1.5 1.5 1.5zm-4 4c2.21 0 4-1.79 4-4h-8c0 2.21 1.79 4 4 4z" />
                </svg>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-gray-800 border border-gray-700 text-gray-100">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 w-full bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-cyan-600 text-white px-5 py-3 rounded-xl hover:bg-cyan-700 transition-all disabled:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>

      {/* Share Link */}
      {isShareBoxVisible && (
        <div className="fixed bottom-20 w-full bg-gray-800 border-t border-gray-700 p-4">
          <div className="max-w-3xl mx-auto">
            <button onClick={handleShare} className="bg-cyan-600 text-white px-5 py-3 rounded-xl hover:bg-cyan-700 transition-all">
              Generate Shareable Link
            </button>
            {shareLink && (
              <div className="mt-4">
                <input type="text" value={shareLink} readOnly className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-gray-100 focus:outline-none" />
                <button onClick={handleCopy} className="bg-cyan-600 text-white px-5 py-3 rounded-xl hover:bg-cyan-700 transition-all mt-2">
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

