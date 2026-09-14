import React, { useState, useEffect } from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { TabType } from '../../types';

interface TopNavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  vpsOnline: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ currentTab, onSelectTab, vpsOnline }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'chat', label: 'DASHBOARD' },
    { id: 'vision', label: 'VISION HUD' },
    { id: 'cosmos', label: '3D COSMOS' },
    { id: 'tasks', label: 'TASKS' },
    { id: 'projects', label: 'PROJECTS' },
    { id: 'memory', label: 'MEMORY' },
    { id: 'news', label: 'INTELLIGENCE' },
    { id: 'routines', label: 'ROUTINES' },
    { id: 'agent', label: 'LAPTOP AGENT' },
    { id: 'settings', label: 'SETTINGS' },
  ];

  return (
    <nav style={{
      height: '46px',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#020305',
      borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
      fontFamily: 'JetBrains Mono, monospace',
      userSelect: 'none',
      zIndex: 50
    }}>
      {/* Left: Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0, 242, 254, 0.4)',
          borderRadius: '4px',
          color: '#00f2fe'
        }}>
          <Shield size={12} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px', color: '#fff' }}>
            ARVIX AI
          </span>
          <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)', letterSpacing: '1px' }}>
            // NEURAL INTERFACE
          </span>
        </div>
      </div>

      {/* Center: Tech Navigation Segmented Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'rgba(255, 255, 255, 0.02)',
        padding: '3px 4px',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {tabs.map((t) => {
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              style={{
                background: isActive ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid transparent',
                borderRadius: '4px',
                padding: '4px 12px',
                color: isActive ? '#00f2fe' : 'rgba(255, 255, 255, 0.45)',
                fontSize: '10.5px',
                fontWeight: 600,
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {isActive && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#00f2fe' }} />}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Live Telemetry & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: vpsOnline ? '#10b981' : '#ef4444',
            boxShadow: vpsOnline ? '0 0 8px #10b981' : 'none'
          }} />
          <span style={{ color: vpsOnline ? '#10b981' : '#ef4444', fontWeight: 600, letterSpacing: '0.8px' }}>
            'LOCAL CORE ONLINE'
          </span>
        </div>

        <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>

        <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600 }}>
          100%
        </span>

        <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>

        <span style={{ color: '#fff', fontWeight: 500, letterSpacing: '0.5px' }}>
          {timeStr}
        </span>
      </div>
    </nav>
  );
};
