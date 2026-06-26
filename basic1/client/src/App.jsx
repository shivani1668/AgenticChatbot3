import React, { useState } from 'react';
import { Menu, Send, Mic, MessageSquare, Image as ImageIcon, Mic2, Search } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [input, setInput] = useState('');

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-[#1e3a5f] font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white p-4 flex justify-between items-center shadow-md">
        <Menu size={24} className="cursor-pointer" />
        <h1 className="text-xl font-semibold">Allen</h1>
        <button className="bg-[#334155] px-3 py-1 rounded text-xs font-bold tracking-wider">CHAT</button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        {/* Avatar */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-6">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Allen&backgroundColor=b6e3f4"
            alt="Allen Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Speech Bubble */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 max-w-xs w-full">
          <h2 className="text-2xl font-bold text-center leading-tight">
            Good Morning, what task can I do for you?
          </h2>
        </div>

        {/* Features Section */}
        <div className="w-full max-w-sm">
          <h3 className="text-lg font-bold mb-4 px-2">Here are a few features</h3>

          <div className="space-y-4">
            {/* Feature 1 */}
            <div className="bg-[#bae6fd] p-5 rounded-3xl shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold mb-2">Hugging Face Chat</h4>
              <p className="text-sm text-[#0c4a6e] font-medium leading-relaxed">
                Powered by Mistral-7B via HF Inference API — ask anything
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#7dd3fc] p-5 rounded-3xl shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold mb-2">Image Generation</h4>
              <p className="text-sm text-[#0c4a6e] font-medium leading-relaxed">
                Create stunning visuals with Stable Diffusion XL via HF
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Navigation */}
      <footer className="p-4 bg-white border-t border-gray-100">
        {/* Tab Buttons */}
        <div className="flex justify-between gap-2 mb-4 max-w-sm mx-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold transition-colors ${
              activeTab === 'chat' ? 'bg-[#1e3a5f] text-white' : 'bg-white border border-gray-200 text-gray-500'
            }`}
          >
            <MessageSquare size={18} />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold transition-colors ${
              activeTab === 'image' ? 'bg-[#1e3a5f] text-white' : 'bg-white border border-gray-200 text-gray-500'
            }`}
          >
            <ImageIcon size={18} />
            <span>Image</span>
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold transition-colors ${
              activeTab === 'voice' ? 'bg-[#1e3a5f] text-white' : 'bg-white border border-gray-200 text-gray-500'
            }`}
          >
            <Mic2 size={18} />
            <span>Voice</span>
          </button>
        </div>

        {/* Search Input Area */}
        <div className="flex items-center gap-3 max-w-sm mx-auto">
          <div className="bg-[#e0f2fe] p-3 rounded-full text-[#1e3a5f] cursor-pointer">
            <Mic size={24} />
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Allen anything..."
              className="w-full bg-white border border-gray-200 rounded-full py-3 px-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#7dd3fc] shadow-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1e3a5f] p-2 rounded-full text-white cursor-pointer">
              <Send size={18} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
