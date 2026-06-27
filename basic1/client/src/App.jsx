import React, { useState, useEffect, useRef } from 'react';
import { Menu, Send, MessageSquare, Image as ImageIcon, Mic2 } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'https://agenticchatbot3-1.onrender.com';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) throw new Error(`Server responded with ${response.status}`);

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Connection Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble reaching the server. Please check your internet or the backend status."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans max-w-md mx-auto shadow-2xl overflow-hidden">
      <header className="p-4 flex items-center justify-between border-b bg-white shadow-sm z-10">
        <Menu className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900 transition-colors" />
        <span className="font-bold text-xl tracking-tight text-[#1e3a5f]">Allen CHAT</span>
        <div className="w-6" />
      </header>

      <main className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
            <div className="w-24 h-24 bg-gradient-to-br from-[#7dd3fc] to-[#1e3a5f] rounded-full mb-6 flex items-center justify-center shadow-lg">
              <span className="text-white text-4xl font-bold">A</span>
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-xs">
              <p className="text-gray-700">Good Morning, I am Allen. What task can I do for you today?</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#1e3a5f] text-white rounded-tr-none'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none text-gray-500 text-xs flex items-center gap-2 shadow-sm">
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              Allen is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-white border-t space-y-4">
        <div className="flex gap-2">
          {['chat', 'image', 'voice'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-[#1e3a5f] text-white shadow-lg scale-[1.02]'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab === 'chat' && <MessageSquare className="w-4 h-4" />}
              {tab === 'image' && <ImageIcon className="w-4 h-4" />}
              {tab === 'voice' && <Mic2 className="w-4 h-4" />}
              <span className="text-xs">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </button>
          ))}
        </div>

        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={activeTab === 'chat' ? "Ask Allen anything..." : `Use ${activeTab} feature...`}
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-[#7dd3fc] focus:bg-white transition-all shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-white transition-all transform active:scale-95 ${
              isLoading || !input.trim() ? 'bg-gray-300' : 'bg-[#1e3a5f] hover:bg-[#2a5288] shadow-md'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-400">Powered by Robotics Club Assistant • AI can make mistakes</p>
      </footer>
    </div>
  );
};

export default App;
