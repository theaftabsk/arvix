import React from 'react';
import { Terminal, Shield, Laptop } from 'lucide-react';
import { DeviceCommandLog } from '../../types';

interface LaptopAgentViewProps {
  commandLogs: DeviceCommandLog[];
  onTestCommand: (action: string, target: string) => void;
}

export const LaptopAgentView: React.FC<LaptopAgentViewProps> = ({ commandLogs, onTestCommand }) => {
  return (
    <div style={{
      flex: 1,
      height: 'calc(100vh - 46px)',
      overflowY: 'auto',
      padding: '28px 40px',
      background: '#030507',
      fontFamily: 'JetBrains Mono, monospace',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      userSelect: 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>
            LAPTOP AGENT BRIDGE // WINDOWS EXECUTION NODE
          </h2>
          <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '2px', display: 'block' }}>
            WEBSOCKET LISTENER // LOCAL PHYSICAL ACTION DISPATCHER
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onTestCommand('open_app', 'Visual Studio Code')} className="btn-ghost">
            SIMULATE [OPEN VS CODE]
          </button>
          <button onClick={() => onTestCommand('search_file', 'Downloads')} className="btn-ghost">
            SIMULATE [SEARCH DOWNLOADS]
          </button>
        </div>
      </div>

      {/* Permission Gate Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px'
      }}>
        <div style={{ padding: '12px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.25)', background: 'rgba(16, 185, 129, 0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981' }}>🟢 LEVEL 1: SAFE</div>
          <p style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px', lineHeight: 1.5 }}>
            Open apps (VS Code, Chrome), file discovery, screen state. Auto-approved.
          </p>
        </div>

        <div style={{ padding: '12px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.25)', background: 'rgba(245, 158, 11, 0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b' }}>🟡 LEVEL 2: SENSITIVE</div>
          <p style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px', lineHeight: 1.5 }}>
            Modifying project code, creating local files. Notification alert dispatched.
          </p>
        </div>

        <div style={{ padding: '12px', borderRadius: '4px', border: '1px solid rgba(225, 29, 72, 0.25)', background: 'rgba(225, 29, 72, 0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#e11d48' }}>🔴 LEVEL 3: CRITICAL</div>
          <p style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px', lineHeight: 1.5 }}>
            File deletion, system terminal commands, credential access. Multi-factor prompt required.
          </p>
        </div>
      </div>

      {/* Stream Terminal */}
      <div style={{
        flex: 1,
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#010204',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#00f2fe' }}>
            <Terminal size={13} />
            <span>ws_agent_stream.log</span>
          </div>

          <span style={{ fontSize: '9.5px', color: '#10b981' }}>
            ● LISTENING ON WS://LOCALHOST:8000/WS/WINDOWS
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
          {commandLogs.map(log => (
            <div
              key={log.id}
              style={{
                padding: '8px 12px',
                borderRadius: '3px',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                background: 'rgba(255, 255, 255, 0.01)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#00f2fe' }}>➔</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>[{log.timestamp}]</span>
                <span style={{ color: '#b827fc' }}>{log.sender}:</span>
                <span style={{ color: '#fff' }}>EXEC `{log.commandType} ({log.target})`</span>
              </div>

              <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>
                ✓ {log.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
