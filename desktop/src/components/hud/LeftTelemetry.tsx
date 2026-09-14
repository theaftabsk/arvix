import React from 'react';
import { Camera, Activity, Cpu, HardDrive, Thermometer, ShieldAlert } from 'lucide-react';

interface LeftTelemetryProps {
  vpsPing: number;
  vpsOnline: boolean;
}

export const LeftTelemetry: React.FC<LeftTelemetryProps> = ({ vpsPing, vpsOnline }) => {
  return (
    <aside style={{
      width: '280px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '20px 16px',
      fontFamily: 'JetBrains Mono, monospace',
      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      userSelect: 'none'
    }}>
      {/* 1. Optics / Vision Card */}
      <div style={{
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        background: 'rgba(255, 255, 255, 0.015)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.4)' }} />
            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '1px' }}>
              OPTICS OFFLINE
            </span>
          </div>
        </div>

        <div style={{
          height: '90px',
          borderRadius: '4px',
          border: '1px dashed rgba(255, 255, 255, 0.09)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          color: 'rgba(255, 255, 255, 0.25)'
        }}>
          <Camera size={22} strokeWidth={1.5} />
          <span style={{ fontSize: '9px', letterSpacing: '1.5px' }}>NO STREAM</span>
        </div>
      </div>

      {/* 2. Network Telemetry */}
      <div style={{
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        background: 'rgba(255, 255, 255, 0.015)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '1px' }}>
            NETWORK TELEMETRY
          </span>
          <span style={{ fontSize: '9px', color: '#00f2fe', padding: '1px 5px', border: '1px solid rgba(0, 242, 254, 0.25)', borderRadius: '3px' }}>
            SOCKET
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '6px',
          paddingTop: '4px'
        }}>
          <div>
            <div style={{ fontSize: '8.5px', color: 'rgba(255, 255, 255, 0.35)', letterSpacing: '0.5px' }}>RTT LATENCY</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#00f2fe', marginTop: '2px' }}>
              {'< 1ms'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '8.5px', color: 'rgba(255, 255, 255, 0.35)', letterSpacing: '0.5px' }}>PACKET RATE</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
              99.8%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '8.5px', color: 'rgba(255, 255, 255, 0.35)', letterSpacing: '0.5px' }}>ROUTING</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
              LOCAL CORE
            </div>
          </div>
        </div>
      </div>

      {/* 3. Core Metrics */}
      <div style={{
        flex: 1,
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        background: 'rgba(255, 255, 255, 0.015)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '1px' }}>
          CORE METRICS
        </span>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '8px',
          flex: 1
        }}>
          {/* CPU Box */}
          <div style={{
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.4)' }}>CPU LOAD</span>
              <Cpu size={12} color="#00f2fe" />
            </div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
              18%
            </div>
          </div>

          {/* RAM Box */}
          <div style={{
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.4)' }}>RAM USAGE</span>
              <HardDrive size={12} color="#7928ca" />
            </div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
              42%
            </div>
          </div>

          {/* TEMP Box */}
          <div style={{
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.4)' }}>TEMP</span>
              <Thermometer size={12} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
              48°C
            </div>
          </div>

          {/* OS Box */}
          <div style={{
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.4)' }}>OS HOST</span>
              <Activity size={12} color="#10b981" />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', letterSpacing: '0.5px' }}>
              WIN x64
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
