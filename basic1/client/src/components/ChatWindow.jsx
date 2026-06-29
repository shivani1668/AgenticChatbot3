import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Sparkles, User, MoreHorizontal, Terminal, Plus } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import useChatStore from '../store/useChatStore';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';

const ChatWindow = () => {
  const [input, setInput] = useState('');
  const { id } = useParams();

  const {
    messages,
    sendMessage,
    isLoading,
    setSidebarOpen,
    activeConversationId,
    selectConversation,
    createConversation, // Added for the center button
    conversations,
    isDarkMode
  } = useChatStore();

  const scrollRef = useRef(null);
  const activeChat = conversations.find(c => c._id === activeConversationId);

  useEffect(() => {
    if (id && id !== activeConversationId) {
      selectConversation(id);
    }
  }, [id, activeConversationId, selectConversation]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const handleNewChatInCenter = async () => {
    await createConversation();
  };

  const groupMessagesByDate = () => {
    const groups = [];
    let lastDate = '';

    messages.forEach(msg => {
      const dateObj = new Date(msg.createdAt);
      let dateStr = format(dateObj, 'yyyy-MM-dd');

      if (dateStr !== lastDate) {
        let label = format(dateObj, 'MMMM d, yyyy');
        if (isToday(dateObj)) label = 'Today';
        else if (isYesterday(dateObj)) label = 'Yesterday';

        groups.push({ type: 'divider', label });
        lastDate = dateStr;
      }
      groups.push({ type: 'message', ...msg });
    });

    return groups;
  };

  const displayItems = groupMessagesByDate();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Mobile Menu Button */}
      {!activeConversationId && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 left-4 p-3 bg-purple-600 text-white rounded-xl shadow-lg md:hidden z-50 hover:bg-purple-700 transition-colors"
        >
          <Menu size={24} />
        </button>
      )}

      {!activeConversationId && !isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-2xl mb-8 animate-bounce">
            <Terminal size={40} />
          </div>
          <h2 className="text-3xl font-black mb-4">Welcome to Allen CHAT</h2>
          <p className="text-slate-500 max-w-md leading-relaxed mb-8">
            Select a conversation from the sidebar or start a new one to begin.
          </p>

          {/* CENTER NEW CHAT BUTTON */}
          <button
            onClick={handleNewChatInCenter}
            className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            <Plus size={24} />
            <span>Start New Chat</span>
          </button>
        </div>
      ) : (
        <>
          {/* Top Bar */}
          <header className={clsx(
            "p-4 border-b flex items-center justify-between sticky top-0 z-10",
            isDarkMode ? "bg-[#0f172a]/80 backdrop-blur-md border-slate-800" : "bg-white/80 backdrop-blur-md border-slate-200"
          )}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-slate-500/10 rounded-lg md:hidden"
              >
                <Menu size={20} />
              </button>
              <div>
                <h2 className="font-bold truncate max-w-[200px] md:max-w-md">{activeChat?.title || 'Current Chat'}</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">System Connected</span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-500/10 rounded-lg text-slate-400">
              <MoreHorizontal size={20} />
            </button>
          </header>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            {displayItems.map((item, idx) => (
              item.type === 'divider' ? (
                <div key={`div-${idx}`} className="flex justify-center my-8">
                  <span className={clsx(
                    "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    isDarkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"
                  )}>
                    {item.label}
                  </span>
                </div>
              ) : (
                <div
                  key={item._id}
                  className={clsx(
                    "flex flex-col max-w-[85%] md:max-w-[70%] space-y-2 group",
                    item.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {item.role === 'user' ? 'You' : 'Allen'}
                    </span>
                  </div>

                  <div className={clsx(
                    "p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                    item.role === 'user'
                      ? "bg-purple-600 text-white rounded-tr-none shadow-purple-500/10"
                      : (isDarkMode ? "bg-slate-800 text-slate-200 rounded-tl-none" : "bg-white border border-slate-100 text-slate-800 rounded-tl-none")
                  )}>
                    {item.content}
                  </div>

                  {/* VISIBLE TIMESTAMP */}
                  <span className="text-[9px] text-slate-500 font-medium px-1 opacity-100">
                    {format(new Date(item.createdAt), 'hh:mm a')}
                  </span>
                </div>
              )
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 text-slate-500 text-xs italic">
                <Sparkles size={14} className="animate-spin text-purple-500" />
                Allen is typing...
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div className={clsx(
            "p-4 md:p-6 border-t",
            isDarkMode ? "bg-[#0f172a] border-slate-800" : "bg-white border-slate-200"
          )}>
            <form
              onSubmit={handleSend}
              className="max-w-4xl mx-auto flex items-end gap-3"
            >
              <div className="flex-1 relative">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message here..."
                  className={clsx(
                    "w-full resize-none bg-transparent rounded-2xl py-4 px-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner max-h-40",
                    isDarkMode ? "bg-slate-800/50" : "bg-slate-100"
                  )}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 bottom-3 p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
