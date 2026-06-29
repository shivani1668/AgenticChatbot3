import { create } from 'zustand';
import axios from 'axios';

// Ensure the trailing slash or missing /api is handled
const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:5000/api').replace(/\/$/, '');

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  sidebarOpen: true,
  rightPanelOpen: false,
  isDarkMode: localStorage.getItem('theme') === 'dark',

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  toggleDarkMode: () => {
    const newMode = !get().isDarkMode;
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    set({ isDarkMode: newMode });
  },

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_BASE}/conversations`);
      set({ conversations: res.data });
    } catch (err) {
      console.error('Fetch conversations error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  createConversation: async (title = 'New Chat') => {
    try {
      const res = await axios.post(`${API_BASE}/conversations`, { title });
      const newConv = res.data;
      set((state) => ({
        conversations: [newConv, ...state.conversations],
        activeConversationId: newConv._id,
        messages: []
      }));
      return newConv._id;
    } catch (err) {
      console.error('Create conversation error:', err);
      return null;
    }
  },

  selectConversation: async (id) => {
    if (!id) {
      set({ activeConversationId: null, messages: [] });
      return;
    }
    set({ activeConversationId: id, isLoading: true });
    try {
      const res = await axios.get(`${API_BASE}/conversations/${id}/messages`);
      set({ messages: res.data });
    } catch (err) {
      console.error('Select conversation error:', err);
      set({ messages: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteConversation: async (id) => {
    try {
      await axios.delete(`${API_BASE}/conversations/${id}`);
      set((state) => ({
        conversations: state.conversations.filter((c) => c._id !== id),
        activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
        messages: state.activeConversationId === id ? [] : state.messages,
      }));
    } catch (err) {
      console.error('Delete conversation error:', err);
    }
  },

  renameConversation: async (id, title) => {
    try {
      const res = await axios.post(`${API_BASE}/conversations/${id}/rename`, { title });
      set((state) => ({
        conversations: state.conversations.map((c) => c._id === id ? { ...c, title: res.data.title } : c)
      }));
    } catch (err) {
      console.error('Rename conversation error:', err);
    }
  },

  sendMessage: async (content) => {
    const { activeConversationId } = get();
    if (!activeConversationId || !content.trim()) return;

    // Optimistically add user message
    const userMsg = { _id: Date.now().toString(), role: 'user', content, createdAt: new Date() };
    set((state) => ({ messages: [...state.messages, userMsg], isLoading: true }));

    try {
      const res = await axios.post(`${API_BASE}/conversations/${activeConversationId}/messages`, { content });
      set((state) => ({
        messages: [...state.messages, res.data],
        // Refresh conversations to update the "last updated" time in the sidebar
        conversations: state.conversations.map(c =>
          c._id === activeConversationId ? { ...c, updatedAt: new Date() } : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      }));
    } catch (err) {
      console.error('Send message error:', err);
      const errorMsg = { _id: 'err-' + Date.now(), role: 'assistant', content: 'Sorry, I failed to send that message.', createdAt: new Date() };
      set((state) => ({ messages: [...state.messages, errorMsg] }));
    } finally {
      set({ isLoading: false });
    }
  },

  clearChat: () => {
    set({ activeConversationId: null, messages: [] });
  }
}));

export default useChatStore;
