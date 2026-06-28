import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ProfilePanel from './components/ProfilePanel';
import useChatStore from './store/useChatStore';
import clsx from 'clsx';

const App = () => {
  const { isDarkMode, sidebarOpen } = useChatStore();

  useEffect(() => {
    // Sync theme with body class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <div className={clsx(
      "flex h-screen w-full overflow-hidden transition-colors duration-300",
      isDarkMode ? "bg-[#0f172a] text-slate-200" : "bg-slate-50 text-slate-800"
    )}>
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className={clsx(
        "flex-1 flex flex-col h-full transition-all duration-300 relative",
        sidebarOpen ? "md:ml-[260px]" : "ml-0"
      )}>
        <Routes>
          <Route path="/" element={<ChatWindow />} />
          <Route path="/chat/:id" element={<ChatWindow />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Right Profile Panel */}
      <ProfilePanel />
    </div>
  );
};

export default App;
