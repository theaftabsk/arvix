import React, { useState } from 'react';
import { Shield, Server, Lock, Cpu, Smartphone, Laptop, CheckCircle, RefreshCw, KeyRound } from 'lucide-react';

export const CommandCenterSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'security' | 'devices'>('system');
  const [pairingCopied, setPairingCopied] = useState(false);

  const pairingCode = "ARVIX-9204-SYNC";

  const copyPairingCode = () => {
    navigator.clipboard.writeText(pairingCode);
    setPairingCopied(true);
    setTimeout(() => setPairingCopied(false), 2000);
  };

  return (
    <div style={{
      flex: 1,
      height: 'calc(100vh - 46px)',
      overflowY: 'auto',
      padding: '36px 48px',
      background: '#030507',
      fontFamily: 'JetBrains Mono, monospace',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      alignItems: 'center',
      userSelect: 'none'
    }}>
      {/* Header Bar */}
      <div style={{
        width: '100%',
        maxWidth: '840px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '6px',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            background: 'rgba(0, 242, 254, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00f2fe'
          }}>
            <Server size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>
              COMMAND CENTER // SYSTEM
            </h2>
            <span style={{ fontSize: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
              ARVIX CORE ONLINE // VPS LINKED
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '3px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          {(['system', 'security', 'devices'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                background: activeTab === t ? '#fff' : 'transparent',
                color: activeTab === t ? '#000' : 'rgba(255, 255, 255, 0.45)',
                border: 'none',
                borderRadius: '3px',
                padding: '5px 14px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '1px',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel */}
      <div style={{
        width: '100%',
        maxWidth: '840px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {activeTab === 'system' && (
          <>
            {/* System Status Banner */}
            <div style={{
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.015)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '1px' }}>
                ARCHITECTURE TELEMETRY
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px'
              }}>
                <div style={{ padding: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.35)' }}>AI ORCHESTRATOR</span>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#00f2fe', marginTop: '4px' }}>
                    Groq LPU 120B
                  </div>
                  <span style={{ fontSize: '9px', color: '#10b981' }}>● PRIMARY ACTIVE</span>
                </div>

                <div style={{ padding: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.35)' }}>BACKUP MODEL</span>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                    Gemini 1.5 Flash
                  </div>
                  <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.4)' }}>STANDBY</span>
                </div>

                <div style={{ padding: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.35)' }}>CENTRAL DATABASE</span>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                    PostgreSQL + Vector
                  </div>
                  <span style={{ fontSize: '9px', color: '#10b981' }}>● SYNCED</span>
                </div>

                <div style={{ padding: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.35)' }}>COMMUNICATION</span>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#00f2fe', marginTop: '4px' }}>
                    Dual WebSocket Hub
                  </div>
                  <span style={{ fontSize: '9px', color: '#10b981' }}>● 14ms LATENCY</span>
                </div>
              </div>
            </div>

            {/* Secure VPS Vault Banner (No hard-coded naked keys) */}
            <div style={{
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.015)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={14} color="#00f2fe" />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.8px' }}>
                    VPS CREDENTIAL VAULT // ZERO CLIENT EXPOSURE
                  </span>
                </div>
                <span style={{ fontSize: '9.5px', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 6px', borderRadius: '3px' }}>
                  ENCRYPTED AT REST
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '11px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>GROQ_API_KEY</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>● SECURED IN VPS (.env) // ACTIVE</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '11px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>GEMINI_API_KEY</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>● SECURED IN VPS (.env) // ACTIVE</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '11px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>JWT AUTHENTICATION TOKEN</span>
                  <span style={{ color: '#00f2fe', fontWeight: 700 }}>● DEVICE VALIDATED</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'devices' && (
          <div style={{
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.015)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '1px' }}>
              CROSS-DEVICE NODES // MOBILE ↔ LAPTOP BRIDGE
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* Laptop Node */}
              <div style={{ padding: '16px', borderRadius: '4px', border: '1px solid rgba(0, 242, 254, 0.25)', background: 'rgba(0, 242, 254, 0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Laptop size={18} color="#00f2fe" />
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Windows Laptop Host</h4>
                    <span style={{ fontSize: '10px', color: '#10b981' }}>● EXECUTING AGENT ACTIVE</span>
                  </div>
                </div>
                <p style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.45)', marginTop: '8px', lineHeight: 1.5 }}>
                  This PC acts as the physical hands: running apps, reading local project files, and opening VS Code.
                </p>
              </div>

              {/* Mobile Node */}
              <div style={{ padding: '16px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Smartphone size={18} color="#7928ca" />
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Android Mobile Node</h4>
                    <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)' }}>FLUTTER CLIENT READY</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.6)' }}>PAIRING CODE:</span>
                  <button
                    onClick={copyPairingCode}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '3px',
                      color: '#00f2fe',
                      padding: '3px 8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {pairingCopied ? 'COPIED!' : pairingCode}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div style={{
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.015)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '1px' }}>
              3-TIER PERMISSION SECURITY GATE
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '12px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.25)', background: 'rgba(16, 185, 129, 0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#10b981' }}>🟢 LEVEL 1: SAFE</span>
                  <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.45)', marginTop: '2px' }}>
                    Web research, tech news, time routine triggers, app launch (VS Code, Chrome).
                  </div>
                </div>
                <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>AUTO-APPROVED</span>
              </div>

              <div style={{ padding: '12px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.25)', background: 'rgba(245, 158, 11, 0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#f59e0b' }}>🟡 LEVEL 2: SENSITIVE</span>
                  <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.45)', marginTop: '2px' }}>
                    Modifying project notes, writing new files, memory updates.
                  </div>
                </div>
                <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 700 }}>NOTIFICATION PROMPT</span>
              </div>

              <div style={{ padding: '12px', borderRadius: '4px', border: '1px solid rgba(225, 29, 72, 0.25)', background: 'rgba(225, 29, 72, 0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#e11d48' }}>🔴 LEVEL 3: CRITICAL</span>
                  <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.45)', marginTop: '2px' }}>
                    File deletion, running destructive system terminal commands, credential access.
                  </div>
                </div>
                <span style={{ fontSize: '10px', color: '#e11d48', fontWeight: 700 }}>EXPLICIT VERIFICATION REQUIRED</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
