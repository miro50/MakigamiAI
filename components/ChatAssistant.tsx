import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X } from 'lucide-react';
import { chatWithAnalyst } from '../services/geminiService';

interface Props {
  context: string;
}

const ChatAssistant: React.FC<Props> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "Hello, I am your Makigami Process Analyst. I've analyzed your process. Do you have any questions about the potential bottlenecks or improvement opportunities?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Prepare history for Gemini API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      // Add current context
      history.unshift({
        role: 'user',
        parts: [{ text: `Current Process Context for analysis: ${context}` }]
      });

      const response = await chatWithAnalyst(history, userMsg);
      if (response) {
        setMessages(prev => [...prev, { role: 'model', text: response }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the analysis engine right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 z-50 flex items-center justify-center"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">Process Consultant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-700 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`
                    max-w-[85%] p-3 rounded-2xl text-sm
                    ${msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'}
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about efficiencies..."
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
