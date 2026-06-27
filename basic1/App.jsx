import React, { useState, useEffect, useRef } from 'react';
import { Menu, Send, MessageSquare, Search, Settings, Globe, Database, Share2, Mail, FileText, Calendar, TrendingUp, Sparkles, Terminal, Sun, Moon } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Robotics Club Agentic Assistant. I can help with RAG search, Neo4j graphs, and Google service tasks. How can I assist you today?' }
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
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend, history: newMessages.slice(0, -1) }),
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

  const features = [
    { title: "GPT-based Q&A", tool: "LangChain + Groq (Llama 3)", icon: <MessageSquare size={20} />, color: "bg-blue-100", darkColor: "bg-blue-900/30", desc: "Fast & Free inference via Groq Cloud" },
    { title: "Document search (RAG)", tool: "MongoDB Atlas + HF Embeddings", icon: <Database size={20} />, color: "bg-green-100", darkColor: "bg-green-900/30", desc: "Context-aware retrieval from your docs" },
    { title: "Context with graphs", tool: "Neo4j Aura (Free Tier)", icon: <Share2 size={20} />, color: "bg-purple-100", darkColor: "bg-purple-900/30", desc: "Member & project mapping models" },
    { title: "Agentic planning", tool: "LangGraph / AgentExecutor", icon: <Globe size={20} />, color: "bg-orange-100", darkColor: "bg-orange-900/30", desc: "Multi-step tool execution logic" },
    { title: "Email & Forms", tool: "Gmail & Forms API", icon: <Mail size={20} />, color: "bg-red-100", darkColor: "bg-red-900/30", desc: "Automated club notifications" },
    { title: "Google Drive", tool: "Drive API Integration", icon: <FileText size={20} />, color: "bg-yellow-100", darkColor: "bg-yellow-900/30", desc: "Retrieve technical documents" },
    { title: "Task Tracking", tool: "Pandas & Neo4j", icon: <TrendingUp size={20} />, color: "bg-indigo-100", darkColor: "bg-indigo-900/30", desc: "Skill mapping & performance logs" },
    { title: "Event Management", tool: "JSON Storage", icon: <Calendar size={20} />, color: "bg-pink-100", darkColor: "bg-pink-900/30", desc: "Reminders & evaluation workflows" },
  ];

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-[#f8fafc] text-[#1e293b]'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-[#1e293b]' : 'bg-[#0f172a]'} text-white p-4 flex justify-between items-center shadow-lg z-10 transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Terminal size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Robotics Club Agent v3</h1>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-gray-300'} font-bold uppercase tracking-widest`}>Free Tier Engine</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-yellow-400' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-4 flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
            <div className="flex-1 space-y-4 mb-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm transition-colors duration-300 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : (isDarkMode ? 'bg-[#1e293b] border border-slate-700 text-slate-200 rounded-tl-none' : 'bg-white border border-gray-200 text-[#1e293b] rounded-tl-none')
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`flex items-center gap-2 text-xs italic ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                  <Sparkles size={14} className="animate-spin text-blue-500" />
                  Agent is processing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto w-full py-6">
            <div className={`rounded-3xl p-8 shadow-sm border transition-colors duration-300 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-gray-100'}`}>
              <h2 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Integrated Features & Tools</h2>
              <p className={`mb-8 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>System configuration based on your requirements (All Free-Tier)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {features.map((f, i) => (
                  <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all group ${isDarkMode ? 'border-slate-800 hover:bg-[#253247]' : 'border-gray-50 hover:bg-slate-50'}`}>
                    <div className={`${isDarkMode ? f.darkColor : f.color} p-4 rounded-xl group-hover:scale-110 transition-transform ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{f.icon}</div>
                    <div>
                      <h3 className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>{f.title}</h3>
                      <p className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{f.tool}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation & Input */}
      <footer className={`border-t transition-colors duration-300 p-4 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto">
          {activeTab === 'chat' && (
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask the Agent about club docs, members, or tasks..."
                className={`flex-1 border-none rounded-xl py-3 px-6 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-gray-900'}`}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
          )}

          <div className={`flex justify-center items-center gap-12 border-t pt-3 ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'chat' ? 'text-blue-500' : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600')}`}
            >
              <MessageSquare size={22} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Chat Agent</span>
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'features' ? 'text-blue-500' : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600')}`}
            >
              <TrendingUp size={22} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">System Features</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
