import React from 'react';
import { Camera, PhoneOff, Mic, MicOff, Sparkles } from 'lucide-react';

interface BottomDockProps {
  voiceModeActive: boolean;
  onToggleVoiceMode: () => void;
  onStop: () => void;
  cameraActive: boolean;
  onToggleCamera: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  voiceModeActive,
  onToggleVoiceMode,
  onStop,
  cameraActive,
  onToggleCamera
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      padding: '12px 24px',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '50px',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      backdropFilter: 'blur(20px)',
      userSelect: 'none'
    }}>
      {/* 1. Camera / Screen Vision */}
      <button
        onClick={onToggleCamera}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          border: cameraActive ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.1)',
          background: cameraActive ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
          color: cameraActive ? '#00f2fe' : 'rgba(255, 255, 255, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 150ms ease'
        }}
        title="Optics Vision Stream"
      >
        <Camera size={18} />
      </button>

      {/* 2. Red Call / Stop Core Action */}
      <button
        onClick={onStop}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: 'none',
          background: '#e11d48',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(225, 29, 72, 0.4)',
          transition: 'all 150ms ease'
        }}
        title="Stop Speech / Reset Synapse"
      >
        <PhoneOff size={22} />
      </button>

      {/* 3. Mic / Voice Mode Trigger */}
      <button
        onClick={onToggleVoiceMode}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          border: voiceModeActive ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
          background: voiceModeActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
          color: voiceModeActive ? '#10b981' : 'rgba(255, 255, 255, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: voiceModeActive ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none',
          transition: 'all 150ms ease'
        }}
        title={voiceModeActive ? 'Voice Listening ON' : 'Turn On Voice'}
      >
        {voiceModeActive ? <Mic size={18} /> : <MicOff size={18} />}
      </button>
    </div>
  );
};
