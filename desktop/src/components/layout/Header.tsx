import React from 'react';
import { Cpu, Wifi, Bell, ShieldCheck, Activity, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { TabType } from '../../types';

interface HeaderProps {
  currentTab: TabType;
  vpsPing: number;
  voiceModeActive: boolean;
  onToggleVoiceMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isListening: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  vpsPing,
  voiceModeActive,
  onToggleVoiceMode,
  isMuted,
  onToggleMute,
  isListening
}) => {
  const titles: Record<TabType, { name: string; subtitle: string }> = {
    chat: { name: 'Neural Intelligence Hub', subtitle: 'Central AI Conversational Engine & Tool Executor' },
    vision: { name: 'Vision Intelligence HUD', subtitle: 'Webcam Face Scanning, OCR, Object Detection & Visual Search' },
    cosmos: { name: '3D Solar System Scope', subtitle: 'Interactive WebGL Cosmic Space Simulation & Air Hand Control' },
    tasks: { name: 'Autonomous Task Matrix', subtitle: 'Personal Agenda, Prioritized Queues & Deadlines' },
    projects: { name: 'Projects Command Center', subtitle: 'Cross-device Workspace, Notes & Milestone Tracking' },
    memory: { name: 'Central Memory Core', subtitle: 'Persistent Long-term Knowledge & Semantic Graph' },
    news: { name: 'Live Intelligence Feed', subtitle: 'Curated Artificial Intelligence & Tech Breakthroughs' },
    routines: { name: 'Autonomous Routine Engine', subtitle: 'Background Cron Triggers, Briefings & Automation' },
    agent: { name: 'Windows Laptop Agent', subtitle: 'Device Bridge for Mobile-to-PC Remote Execution' },
    settings: { name: 'Ecosystem Configuration', subtitle: 'VPS Connection, Model Routing & Security Credentials' }
  };

  const info = titles[currentTab] || { name: 'ARVIX', subtitle: 'Personal AI' };

  return (
    <header style={{
      height: '68px',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(7, 9, 14, 0.75)',
      backdropFilter: 'blur(20px)',
      zIndex: 10
    }}>
      {/* Title & Subtitle */}
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.3px' }}>
          {info.name}
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {info.subtitle}
        </p>
      </div>

      {/* Right System Indicators & Voice Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* JARVIS Hands-Free Voice Mode Button */}
        <button
          onClick={onToggleVoiceMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            borderRadius: 'var(--radius-full)',
            border: voiceModeActive ? '1px solid #00f2fe' : '1px solid var(--border-subtle)',
            background: voiceModeActive ? 'rgba(0, 242, 254, 0.18)' : 'rgba(255, 255, 255, 0.04)',
            color: voiceModeActive ? '#00f2fe' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '12.5px',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
            boxShadow: voiceModeActive ? '0 0 20px rgba(0, 242, 254, 0.35)' : 'none'
          }}
          title="Toggle JARVIS Hands-Free Voice Mode"
        >
          {voiceModeActive ? (
            <>
              <div className="wave-bar" style={{ height: '12px' }} />
              <div className="wave-bar" style={{ height: '18px' }} />
              <div className="wave-bar" style={{ height: '10px' }} />
              <span>JARVIS Voice: ON</span>
            </>
          ) : (
            <>
              <Mic size={15} color="#00f2fe" />
              <span>Voice Mode</span>
            </>
          )}
        </button>

        {/* Mute / Unmute Button */}
        <button
          onClick={onToggleMute}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.04)',
            color: isMuted ? 'var(--text-muted)' : '#00f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
          title={isMuted ? 'Unmute ARVIX Voice' : 'Mute ARVIX Voice'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Model Selector Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(0, 242, 254, 0.08)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          boxShadow: '0 0 15px rgba(0, 242, 254, 0.1)'
        }}>
          <Cpu size={15} color="#00f2fe" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#00f2fe' }}>
            Groq 120B
          </span>
          <span style={{
            fontSize: '9.5px',
            fontWeight: 700,
            padding: '1px 5px',
            borderRadius: '4px',
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#10b981'
          }}>
            LPU
          </span>
        </div>

        {/* Latency */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '11.5px',
          color: 'var(--text-muted)'
        }}>
          <Activity size={13} color="#00f2fe" />
          <span>{vpsPing}ms</span>
        </div>
      </div>
    </header>
  );
};
