import React from 'react';
import { X, User, Settings, Shield, Bell, LogOut } from 'lucide-react';
import useChatStore from '../store/useChatStore';
import clsx from 'clsx';

const ProfilePanel = () => {
  const { rightPanelOpen, setRightPanelOpen, isDarkMode } = useChatStore();

  return (
    <>
      {/* Overlay for mobile/desktop when panel is open */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/20 z-40 transition-opacity",
          rightPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setRightPanelOpen(false)}
      />

      <aside className={clsx(
        "fixed right-0 top-0 h-full w-[300px] z-50 transition-transform duration-300 shadow-2xl flex flex-col",
        isDarkMode ? "bg-[#1e293b] text-slate-200" : "bg-white text-slate-800",
        rightPanelOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-slate-200/10">
          <h2 className="text-xl font-bold">Profile Settings</h2>
          <button
            onClick={() => setRightPanelOpen(false)}
            className="p-2 hover:bg-slate-500/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* User Info */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-purple-500/20">
              U
            </div>
            <div>
              <h3 className="text-lg font-bold">Allen User</h3>
              <p className="text-sm text-slate-500">user@allenchat.com</p>
            </div>
            <button className="btn btn-sm btn-outline border-purple-500 text-purple-500 hover:bg-purple-500 hover:border-purple-500">
              Edit Profile
            </button>
          </div>

          {/* Menu Options */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Account Settings</h4>

            <MenuItem icon={<Settings size={18} />} label="General Settings" />
            <MenuItem icon={<Shield size={18} />} label="Privacy & Security" />
            <MenuItem icon={<Bell size={18} />} label="Notifications" />
          </div>

          <div className="pt-4">
            <button className="flex items-center gap-3 w-full p-4 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors font-semibold">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200/10 text-center">
          <p className="text-[10px] text-slate-500">Allen CHAT v3.0.0</p>
        </div>
      </aside>
    </>
  );
};

const MenuItem = ({ icon, label }) => (
  <button className="flex items-center gap-4 w-full p-4 hover:bg-slate-500/5 rounded-xl transition-all text-sm font-medium">
    <span className="text-slate-500">{icon}</span>
    <span>{label}</span>
  </button>
);

export default ProfilePanel;
