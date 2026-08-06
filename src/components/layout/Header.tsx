import React from 'react';
import { Share2, MoreHorizontal, PanelLeft, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  onShare?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'New Consultation',
  onShare,
  isSidebarCollapsed = false,
  onToggleSidebar
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-[#2A2A2A]/60 bg-[#0A0A0A] px-4 flex items-center justify-between sticky top-0 z-10 select-none">
      {/* Left: Sidebar Toggle & Title */}
      <div className="flex items-center space-x-3 min-w-0 pr-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-zinc-400 hover:text-[#FFFFFF] hover:bg-[#171717] rounded-md transition-colors"
            title={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        <h2 className="text-xs sm:text-sm font-medium text-[#FFFFFF] truncate max-w-md">
          {title}
        </h2>
      </div>

      {/* Right: View Mode Toggle, Share, User Avatar */}
      <div className="flex items-center space-x-3 shrink-0">
        
        {/* Workspace Mode Switcher (Patient View) */}
        <div className="flex items-center bg-[#141414] p-1 rounded-lg border border-[#2A2A2A]">
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center space-x-1.5 bg-zinc-800 text-white shadow-sm border border-zinc-700"
          >
            <User className="h-3.5 w-3.5 inline" />
            <span>Patient</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={onShare}
          title="Share conversation"
          className="flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-[#2A2A2A] hover:bg-[#171717] transition-colors"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Three-Dot Menu */}
        <button
          title="More options"
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg border border-[#2A2A2A] hover:bg-[#171717] transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {/* User Avatar */}
        <div className="pl-1 flex items-center">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="h-7 w-7 rounded-full object-cover ring-1 ring-zinc-700" />
          ) : (
            <div className="h-7 w-7 rounded-full bg-[#171717] text-zinc-300 flex items-center justify-center font-semibold text-xs border border-[#2A2A2A]">
              {user?.firstName?.[0] || 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
