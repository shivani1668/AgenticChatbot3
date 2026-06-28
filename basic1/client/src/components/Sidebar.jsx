import React, { useState, useEffect } from 'react';
import { Plus, Search, MessageSquare, Edit2, Trash2, X, Menu, Sun, Moon, User } from 'lucide-react';
import { formatDistanceToNow, isToday, isYesterday, subDays, isAfter } from 'date-fns';
import useChatStore from '../store/useChatStore';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';

const Sidebar = () => {
  const {
    conversations,
    activeConversationId,
    fetchConversations,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    sidebarOpen,
    setSidebarOpen,
    isDarkMode,
    toggleDarkMode,
    setRightPanelOpen
  } = useChatStore();

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (id && id !== activeConversationId) {
      selectConversation(id);
    }
  }, [id, activeConversationId, selectConversation]);

  const handleNewChat = async () => {
    const newId = await createConversation();
    if (newId) navigate(`/chat/${newId}`);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleSelect = (convId) => {
    navigate(`/chat/${convId}`);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const startRename = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv._id);
    setEditTitle(conv.title);
  };

  const saveRename = async (id) => {
    if (editTitle.trim()) {
      await renameConversation(id, editTitle);
    }
    setEditingId(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(id);
      if (activeConversationId === id) navigate('/');
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const groupConversations = () => {
    const groups = {
      Today: [],
      Yesterday: [],
      'Last 7 Days': [],
      Older: []
    };

    filteredConversations.forEach(conv => {
      const date = new Date(conv.updatedAt || conv.createdAt);
      if (isToday(date)) groups.Today.push(conv);
      else if (isYesterday(date)) groups.Yesterday.push(conv);
      else if (isAfter(date, subDays(new Date(), 7))) groups['Last 7 Days'].push(conv);
      else groups.Older.push(conv);
    });

    return groups;
  };

  const groups = groupConversations();

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={clsx(
        "fixed left-0 top-0 h-full bg-[#0f172a] text-slate-300 w-[260px] z-50 transition-transform duration-300 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="bg-purple-600 p-1 rounded-lg"><MessageSquare size={20} /></span>
              Allen CHAT
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 hover:bg-slate-800 rounded"
            >
              <X size={20} />
            </button>
          </div>

          <button
            onClick={handleNewChat}
            className="flex items-center gap-3 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg"
          >
            <Plus size={20} />
            <span>New Chat</span>
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {isLoading && (
            <div className="space-y-3 px-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 w-full bg-slate-800 animate-pulse rounded-lg" />
              ))}
            </div>
          )}
          {!isLoading && Object.entries(groups).map(([label, items]) => items.length > 0 && (
            <div key={label}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">{label}</h3>
              <div className="space-y-1">
                {items.map(conv => (
                  <div
                    key={conv._id}
                    onClick={() => handleSelect(conv._id)}
                    className={clsx(
                      "group relative flex flex-col p-3 rounded-xl cursor-pointer transition-all",
                      activeConversationId === conv._id
                        ? "bg-purple-600/20 border border-purple-500/30 text-white"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {editingId === conv._id ? (
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => saveRename(conv._id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveRename(conv._id)}
                        className="bg-slate-900 text-white text-sm py-1 px-2 rounded border border-purple-500 outline-none w-full"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span className="text-sm font-medium truncate pr-12">{conv.title}</span>
                        <span className="text-[10px] opacity-50 mt-1">
                          {formatDistanceToNow(new Date(conv.updatedAt || conv.createdAt), { addSuffix: true })}
                        </span>

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => startRename(e, conv)}
                            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, conv._id)}
                            className="p-1.5 hover:bg-slate-700 rounded-lg text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 mt-auto border-t border-slate-800 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 w-full p-3 hover:bg-slate-800 rounded-xl transition-colors text-sm"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div
            onClick={() => setRightPanelOpen(true)}
            className="flex items-center gap-3 w-full p-3 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-white">Allen User</p>
              <p className="text-[10px] text-slate-500 truncate">Settings & Profile</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
