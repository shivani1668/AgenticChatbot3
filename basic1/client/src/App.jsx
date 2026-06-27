import React, { useState, useEffect, useRef } from 'react';
import { Menu, Send, MessageSquare, Search, Moon, Sun, Globe, Database, Share2, Mail, FileText, Calendar, TrendingUp } from 'lucide-react';

// Define the API URL based on environment or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Good Morning, what task can I do for you?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSend = async (text) => {
    const messageToSend = text || input;
    if (!messageToSend.trim()) return;

    const newMessages = [...messages, { role: 'user', content: messageToSend }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // FIXED: Uses the API_URL variable instead of hardcoded localhost
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageToSend, 
          history: messages 
        }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const featureCards = [
    { title: "RAG Search", desc: "Powered by MongoDB Atlas & HF — search any club doc.", color: "bg-[#bae6fd]", darkColor: "bg-sky-900/40" },
    { title: "Neo4j Graph", desc: "Mapping member context & technical skills dynamically.", color: "bg-[#7dd3fc]", darkColor: "bg-blue-900/40" },
  ];

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-[#f8fafc] text-[#1e3a5f]'}`}>
      {/* Header */}
      <header className={`p-4 flex justify-between items-center shadow-md transition-colors duration-300 ${isDarkMode ? 'bg-[#1e293b] text-white' : 'bg-[#1e3a5f] text-white'}`}>
        <Menu size={24} className="cursor-pointer" />
        <h1 className="text-xl font-semibold">Allen</h1>
        <div className="flex items-center gap-3">
          <button onClick={toggleDarkMode} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
          </button>
          <button className="bg-[#334155] px-3 py-1 rounded text-xs font-bold tracking-wider uppercase">Chat</button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto p-6 flex flex-col items-center transition-colors duration-300 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center mb-8 w-full max-w-sm">
          <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-lg mb-6 transition-colors duration-300 ${isDarkMode ? 'border-slate-700' : 'border-white'}`}>
            <img 
              src="https://img.freepik.com/premium-vector/female-customer-support-operator-with-headset-avatar_543062-536.jpg" 
              alt="Allen Avatar" 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Allen&background=0D8ABC&color=fff"; }}
            />
          </div>

          <div className="w-full flex flex-col gap-4">
            {messages.length === 1 ? (
              <div className={`rounded-2xl p-6 shadow-sm border mb-4 transition-colors duration-300 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-gray-100'}`}>
                <h2 className="text-2xl font-bold text-center leading-tight">
                  {messages[0].content}
                </h2>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-6 w-full">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-[#1e3a5f] text-white rounded-tr-none' 
                        : (isDarkMode ? 'bg-[#1e293b] text-slate-200 border border-slate-700 rounded-tl-none' : 'bg-white border border-gray-100 text-[#1e3a5f] rounded-tl-none')
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && <div className="text-[10px] text-gray-500 animate-pulse italic mt-2 ml-1">Allen is thinking...</div>}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        {messages.length <= 1 && (
          <div className="w-full max-w-sm">
            <h3 className={`text-lg font-bold mb-4 px-2 ${isDarkMode ? 'text-slate-300' : ''}`}>Here are a few features</h3>
            <div className="space-y-4">
              {featureCards.map((card, i) => (
                <div key={i} className={`p-5 rounded-3xl shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 ${isDarkMode ? card.darkColor : card.color}`}>
                  <h4 className="text-xl font-bold mb-2">Agentic {card.title}</h4>
                  <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-[#0c4a6e]'}`}>
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`p-4 border-t transition-colors duration-300 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-gray-100'}`}>
        <div className="flex justify-center mb-4 max-w-sm mx-auto">
          <button className="flex items-center justify-center gap-2 py-3 px-8 rounded-full font-bold transition-all bg-[#1e3a5f] text-white shadow-lg">
            <MessageSquare size={18} />
            <span className="text-xs">Chat</span>
          </button>
        </div>

        <div className="flex items-center gap-3 max-w-sm mx-auto">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Allen anything..." 
              className={`w-full border rounded-full py-3 px-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-colors duration-300 ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
            <div 
              onClick={() => handleSend()} 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1e3a5f] p-2 rounded-full text-white cursor-pointer hover:bg-blue-800 transition-colors"
            >
              <Send size={18} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
