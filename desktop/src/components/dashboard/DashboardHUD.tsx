import React, { useState } from 'react';
import { LeftTelemetry } from '../hud/LeftTelemetry';
import { RightTranscript } from '../hud/RightTranscript';
import { ParticleCore } from '../core/ParticleCore';
import { BottomDock } from '../hud/BottomDock';
import { ChatMessage } from '../../types';

interface DashboardHUDProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (text: string) => void;
  onSpeak: (text: string) => void;
  vpsPing: number;
  vpsOnline: boolean;
  voiceModeActive: boolean;
  onToggleVoiceMode: () => void;
  onStopSpeech: () => void;
  coreState: 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing';
}

export const DashboardHUD: React.FC<DashboardHUDProps> = ({
  messages,
  loading,
  onSendMessage,
  onSpeak,
  vpsPing,
  vpsOnline,
  voiceModeActive,
  onToggleVoiceMode,
  onStopSpeech,
  coreState
}) => {
  const [cameraActive, setCameraActive] = useState(false);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      height: 'calc(100vh - 46px)',
      overflow: 'hidden',
      background: '#030507'
    }}>
      {/* 1. Left Telemetry Column */}
      <LeftTelemetry vpsPing={vpsPing} vpsOnline={vpsOnline} />

      {/* 2. Center Stage: Holographic Particle Sphere & Dock */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '30px 20px',
        position: 'relative'
      }}>
        {/* Top Status Header */}
        <div style={{
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255, 255, 255, 0.4)',
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          ◈ NEURAL CORE ACTIVE // GEMINI 2.5 FLASH LIVE
        </div>

        {/* Central 3D Particle Sphere */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <ParticleCore state={coreState} />

          {/* Dynamic Status Text */}
          <div style={{
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
            color: coreState === 'thinking' ? '#b827fc' : coreState === 'speaking' ? '#00f2fe' : 'rgba(255, 255, 255, 0.4)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase'
          }}>
            {coreState === 'listening' && '● LISTENING TO AFTAB...'}
            {coreState === 'thinking' && '⚡ GEMINI NEURAL REASONING...'}
            {coreState === 'speaking' && '🔊 VOCALIZING SYNTHESIS...'}
            {coreState === 'executing' && '⚙ EXECUTING LAPTOP AGENT COMMAND...'}
            {coreState === 'idle' && 'SYSTEM STANDBY // READY'}
          </div>
        </div>

        {/* Center Bottom Control Dock */}
        <BottomDock
          voiceModeActive={voiceModeActive}
          onToggleVoiceMode={onToggleVoiceMode}
          onStop={onStopSpeech}
          cameraActive={cameraActive}
          onToggleCamera={() => setCameraActive(!cameraActive)}
        />
      </main>

      {/* 3. Right Transcript Column */}
      <RightTranscript
        messages={messages}
        loading={loading}
        onSendMessage={onSendMessage}
        onSpeak={onSpeak}
      />
    </div>
  );
};
