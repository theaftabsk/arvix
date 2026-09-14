import React from 'react';
import { 
  MessageSquare, 
  CheckSquare, 
  FolderKanban, 
  Brain, 
  Newspaper, 
  Clock, 
  Terminal, 
  Settings, 
  Plus, 
  Sparkles,
  Smartphone,
  Server
} from 'lucide-react';
import { TabType } from '../../types';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onNewChat: () => void;
  vpsOnline: boolean;
  pendingTasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onNewChat,
  vpsOnline,
  pendingTasksCount,
}) => {
  const navItems = [
    { id: 'chat' as TabType, label: 'Neural Chat', icon: MessageSquare, badge: null },
    { id: 'tasks' as TabType, label: 'Task Matrix', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : null },
    { id: 'projects' as TabType, label: 'Projects Hub', icon: FolderKanban, badge: null },
    { id: 'memory' as TabType, label: 'Memory Core', icon: Brain, badge: null },
    { id: 'news' as TabType, label: 'Intelligence Feed', icon: Newspaper, badge: 'Live' },
    { id: 'routines' as TabType, label: 'Routines Engine', icon: Clock, badge: null },
    { id: 'agent' as TabType, label: 'Laptop Agent', icon: Terminal, badge: 'Active' },
    { id: 'settings' as TabType, label: 'Core Settings', icon: Settings, badge: null },
  ];

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      background: 'linear-gradient(180deg, rgba(9, 11, 18, 0.95) 0%, rgba(5, 6, 10, 0.98) 100%)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px',
      gap: '16px',
      backdropFilter: 'blur(20px)',
      zIndex: 20
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 4px 8px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'radial-gradient(circle, #00f2fe 0%, #7928ca 80%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)'
        }}>
          <Sparkles size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '1px' }} className="gradient-text-cyan">
              ARVIX
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe' }}>
              PRO
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Personal AI Ecosystem</span>
        </div>
      </div>

      {/* New Session Action Button */}
      <button 
        onClick={onNewChat}
        className="btn-primary"
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: '11px 16px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13.5px'
        }}
      >
        <Plus size={17} strokeWidth={2.5} />
        <span>New Conversation</span>
      </button>

      {/* Navigation List */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto', marginTop: '6px' }}>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: isActive ? 'linear-gradient(90deg, rgba(0, 242, 254, 0.15) 0%, rgba(121, 40, 202, 0.08) 100%)' : 'transparent',
                color: isActive ? '#00f2fe' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                borderLeft: isActive ? '3px solid #00f2fe' : '3px solid transparent',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                <Icon size={18} color={isActive ? '#00f2fe' : 'var(--text-secondary)'} />
                <span style={{ fontSize: '13.5px', fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(0, 242, 254, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? '#00f2fe' : 'var(--text-muted)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* VPS & Sync Status Card */}
      <div className="glass-panel" style={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: 'rgba(14, 18, 30, 0.8)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={14} color="#00f2fe" />
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>VPS Brain</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="pulse-green" style={{ width: '7px', height: '7px', borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#10b981' }}>Online</span>
          </div>
        </div>

        <div style={{ 
          fontSize: '10.5px', 
          color: 'var(--text-muted)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
          paddingTop: '6px' 
        }}>
          <span>AI Model:</span>
          <span style={{ color: '#00f2fe', fontWeight: 600 }}>Groq 120B</span>
        </div>

        <div style={{ 
          fontSize: '10.5px', 
          color: 'var(--text-muted)', 
          display: 'flex', 
          justifyContent: 'space-between' 
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Smartphone size={11} /> Mobile Sync:
          </span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>Ready</span>
        </div>
      </div>
    </aside>
  );
};
