import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut, 
  Activity,
  PanelLeftClose,
  Search,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  onNewConsultation: () => void;
  history: Array<{ id: string; title: string; date: string; urgency: string }>;
  activeConsultationId?: string;
  onSelectHistoryItem?: (id: string) => void;
  onDeleteHistoryItem?: (id: string, e: React.MouseEvent) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNewConsultation,
  history,
  activeConsultationId,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  isCollapsed,
  onToggleCollapse
}) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredHistory = history.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isCollapsed) {
    return null;
  }

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-[#2A2A2A] flex flex-col h-screen select-none shrink-0 z-20 font-sans transition-all duration-200">
      {/* Top Section: CareFlow Logo & Collapse Toggle */}
      <div className="p-3.5 flex items-center justify-between border-b border-[#2A2A2A]/60">
        <div 
          onClick={onNewConsultation}
          className="flex items-center space-x-2.5 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="h-6 w-6 rounded-md bg-[#171717] border border-[#2A2A2A] flex items-center justify-center text-emerald-400">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-sm text-[#FFFFFF] tracking-tight">CareFlow</span>
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#171717] rounded-md transition-colors"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* New Consultation CTA */}
      <div className="p-3">
        <button
          onClick={onNewConsultation}
          className="w-full flex items-center justify-between bg-[#111111] hover:bg-[#171717] text-white border border-[#2A2A2A] font-medium px-3 py-2 rounded-lg transition-colors text-xs"
        >
          <span className="flex items-center space-x-2">
            <Plus className="h-4 w-4 text-zinc-400" />
            <span>New Consultation</span>
          </span>
        </button>
      </div>

      {/* Search Conversations */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>
      </div>

      {/* Conversation History */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin scrollbar-thumb-[#171717]">
        <div className="px-2 py-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          History
        </div>

        {filteredHistory.length === 0 ? (
          <p className="text-xs text-zinc-600 px-3 py-2 italic">
            {searchQuery ? 'No matching conversations' : 'No past consultations'}
          </p>
        ) : (
          filteredHistory.map((item) => {
            const isActive = activeConsultationId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectHistoryItem?.(item.id)}
                className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-[#171717] text-white font-medium' 
                    : 'text-zinc-400 hover:text-white hover:bg-[#111111]'
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0 pr-2">
                  <MessageSquare className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </div>

                {onDeleteHistoryItem && (
                  <button
                    onClick={(e) => onDeleteHistoryItem(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* User Footer: Profile, Settings, Logout */}
      <div className="p-2 border-t border-[#2A2A2A]/60 space-y-0.5 bg-[#0A0A0A]">
        <button className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#111111] transition-colors">
          <User className="h-4 w-4 text-zinc-500" />
          <span className="truncate">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Profile'}</span>
        </button>

        <button className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#111111] transition-colors">
          <Settings className="h-4 w-4 text-zinc-500" />
          <span>Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4 text-zinc-500" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
