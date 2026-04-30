import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import Markdown from 'react-markdown';

type ChatMessage = { role: 'user' | 'model'; content: string };

export function GeminiChatbot({ user, onLogin }: { user: any; onLogin: (user: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionPhone, setSessionPhone] = useState('');

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'model',
          content:
            'Hello! I am the Farm2Fork assistant. I can help you sign up, log in, or answer questions about the app. How can I help you today?',
        },
      ]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, sessionPhone }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || 'Server error');
      }

      const data = await res.json();

      // Update session phone if backend captured one
      if (data.sessionPhone) setSessionPhone(data.sessionPhone);

      // If user was logged in by a tool call, fire onLogin
      if (data.loggedInUser) onLogin(data.loggedInUser);

      setMessages((prev) => [...prev, { role: 'model', content: data.text }]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: `Sorry, I encountered an error: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-[145px] right-5 w-80 h-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50">
          <div className="bg-[#1b5e20] p-4 text-white flex justify-between items-center relative shadow-sm">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold">Farm2Fork Assistant</span>
            </div>
            <button
              onClick={toggleOpen}
              className="hover:bg-[#2e7d32] p-1 rounded-full transition-colors active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'model' ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${m.role === 'model'
                      ? 'bg-white border border-gray-100 text-gray-800'
                      : 'bg-[#e8f5e9] text-[#1b5e20] border border-[#c8e6c9]'
                    }`}
                >
                  <div className="markdown-body text-sm font-medium">
                    <Markdown>{m.content}</Markdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl shadow-sm italic text-gray-400 text-sm font-medium">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 font-medium focus:outline-none focus:border-[#4caf50] focus:ring-1 focus:ring-[#4caf50] text-gray-700"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-[#4caf50] text-white p-2 rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors w-10 flex justify-center items-center"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={toggleOpen}
        className="fixed bottom-20 right-5 w-14 h-14 bg-[#388e3c] text-white rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(56,142,60,0.4)] hover:bg-[#2e7d32] hover:scale-105 active:scale-95 transition-all z-50 border-2 border-white"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </>
  );
}
