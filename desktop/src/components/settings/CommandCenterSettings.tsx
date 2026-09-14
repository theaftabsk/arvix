import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Server, 
  Lock, 
  Cpu, 
  Smartphone, 
  Laptop, 
  CheckCircle, 
  RefreshCw, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Save, 
  Sparkles,
  ExternalLink,
  Sliders,
  Check
} from 'lucide-react';
import { apiService } from '../../services/api';

export const CommandCenterSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'api_keys' | 'system' | 'devices' | 'security'>('api_keys');
  const [pairingCopied, setPairingCopied] = useState(false);

  // API Key & Model Configuration States
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'gemini' | 'groq'>('gemini');
  const [selectedModel, setSelectedModel] = useState('gemini-flash-lite-latest');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const pairingCode = "ARVIX-9204-SYNC";

  // Fetch current backend settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiService.getSettings();
        if (data) {
          if (data.gemini_api_key) setGeminiKey(data.gemini_api_key);
          if (data.groq_api_key) setGroqKey(data.groq_api_key);
          if (data.default_ai_provider) setActiveProvider(data.default_ai_provider);
          if (data.default_ai_model) setSelectedModel(data.default_ai_model);
        }
      } catch (err) {
        console.warn('Could not fetch settings from backend:', err);
      }
    };
    fetchSettings();
  }, []);

  const copyPairingCode = () => {
    navigator.clipboard.writeText(pairingCode);
    setPairingCopied(true);
    setTimeout(() => setPairingCopied(false), 2000);
  };

  const handleSaveApiKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      await apiService.updateSettings({
        default_ai_provider: activeProvider,
        default_ai_model: selectedModel,
        gemini_api_key: geminiKey,
        groq_api_key: groqKey
      });
      setSaveStatus('SUCCESS // KEYS PERSISTED TO .ENV & ACTIVE');
    } catch (err: any) {
      setSaveStatus('ERROR // COULD NOT PERSIST CONFIGURATION');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
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
        maxWidth: '860px',
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
            <Sliders size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>
              COMMAND CENTER // SETTINGS
            </h2>
            <span style={{ fontSize: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
              ARVIX CORE ONLINE // CONFIG ENGINE READY
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
          {[
            { id: 'api_keys', label: 'AI API KEYS' },
            { id: 'system', label: 'SYSTEM' },
            { id: 'devices', label: 'DEVICES' },
            { id: 'security', label: 'SECURITY' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                background: activeTab === t.id ? '#00f2fe' : 'transparent',
                color: activeTab === t.id ? '#000' : 'rgba(255, 255, 255, 0.55)',
                border: 'none',
                borderRadius: '3px',
                padding: '6px 14px',
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Panel */}
      <div style={{
        width: '100%',
        maxWidth: '860px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* ================= TAB 1: AI API KEYS & MODEL ROUTING ================= */}
        {activeTab === 'api_keys' && (
          <form onSubmit={handleSaveApiKeys} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Save Status Banner */}
            {saveStatus && (
              <div style={{
                padding: '12px 18px',
                borderRadius: '6px',
                background: saveStatus.startsWith('SUCCESS') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${saveStatus.startsWith('SUCCESS') ? '#10b981' : '#ef4444'}`,
                color: saveStatus.startsWith('SUCCESS') ? '#10b981' : '#ef4444',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={14} />
                <span>{saveStatus}</span>
              </div>
            )}

            {/* Provider & Routing Selector */}
            <div style={{
              borderRadius: '8px',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              background: 'rgba(0, 242, 254, 0.02)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={16} color="#00f2fe" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>
                    PRIMARY AI ENGINE ROUTING
                  </span>
                </div>
                <span style={{ fontSize: '9.5px', color: '#00f2fe', background: 'rgba(0, 242, 254, 0.1)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
                  ACTIVE: {activeProvider.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Google Gemini Card */}
                <div 
                  onClick={() => {
                    setActiveProvider('gemini');
                    setSelectedModel('gemini-flash-lite-latest');
                  }}
                  style={{
                    padding: '14px',
                    borderRadius: '6px',
                    border: `1.5px solid ${activeProvider === 'gemini' ? '#00f2fe' : 'rgba(255, 255, 255, 0.08)'}`,
                    background: activeProvider === 'gemini' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.015)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Google Gemini</span>
                    {activeProvider === 'gemini' && <Check size={14} color="#00f2fe" />}
                  </div>
                  <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                    Official Google AI Studio · Fast Bengali, Vision & Chat
                  </p>
                  <span style={{ 
                    fontSize: '9px', 
                    color: geminiKey ? '#10b981' : '#f59e0b', 
                    display: 'block', 
                    marginTop: '8px', 
                    fontWeight: 700 
                  }}>
                    {geminiKey ? '● KEY CONFIGURED' : '○ KEY REQUIRED'}
                  </span>
                </div>

                {/* Groq LPU Card */}
                <div 
                  onClick={() => {
                    setActiveProvider('groq');
                    setSelectedModel('openai/gpt-oss-120b');
                  }}
                  style={{
                    padding: '14px',
                    borderRadius: '6px',
                    border: `1.5px solid ${activeProvider === 'groq' ? '#00f2fe' : 'rgba(255, 255, 255, 0.08)'}`,
                    background: activeProvider === 'groq' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.015)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Groq LPU Engine</span>
                    {activeProvider === 'groq' && <Check size={14} color="#00f2fe" />}
                  </div>
                  <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                    Ultra-low latency inference · 500+ tokens/sec
                  </p>
                  <span style={{ 
                    fontSize: '9px', 
                    color: groqKey ? '#10b981' : '#f59e0b', 
                    display: 'block', 
                    marginTop: '8px', 
                    fontWeight: 700 
                  }}>
                    {groqKey ? '● KEY CONFIGURED' : '○ OPTIONAL / STANDBY'}
                  </span>
                </div>
              </div>

              {/* Active Model Selector */}
              <div>
                <label style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
                  ACTIVE AI MODEL ARCHITECTURE
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: '#0a0f1d',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    color: '#00f2fe',
                    fontSize: '12px',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                >
                  {activeProvider === 'gemini' ? (
                    <>
                      <option value="gemini-flash-lite-latest">gemini-flash-lite-latest (Recommended · Ultra Fast & Free)</option>
                      <option value="gemini-flash-latest">gemini-flash-latest (Standard Google Multimodal)</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (High Throughput)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning)</option>
                    </>
                  ) : (
                    <>
                      <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (Flagship 120B Fast Brain)</option>
                      <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Meta 70B)</option>
                      <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Sub-100ms Instant)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Google Gemini API Key Input Card */}
            <div style={{
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.015)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <KeyRound size={15} color="#00f2fe" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>
                    GOOGLE GEMINI API KEY
                  </span>
                </div>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ 
                    fontSize: '10px', 
                    color: '#00f2fe', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    textDecoration: 'none'
                  }}
                >
                  <span>GET FREE GEMINI KEY</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="Paste Google AI Studio Key (AIzaSy...)"
                  style={{
                    width: '100%',
                    padding: '11px 44px 11px 14px',
                    borderRadius: '6px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: `1px solid ${geminiKey ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono, monospace',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)' }}>
                Saved permanently into local <code style={{ color: '#00f2fe' }}>backend/.env</code>. Directly powers JARVIS conversation, vision scan, and voice intelligence.
              </span>
            </div>

            {/* Groq API Key Input Card */}
            <div style={{
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.015)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <KeyRound size={15} color="#f59e0b" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>
                    GROQ API KEY (OPTIONAL ACCELERATOR)
                  </span>
                </div>
                <a 
                  href="https://console.groq.com/keys" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ 
                    fontSize: '10px', 
                    color: '#f59e0b', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    textDecoration: 'none'
                  }}
                >
                  <span>GET FREE GROQ KEY</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showGroqKey ? 'text' : 'password'}
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="Paste Groq Cloud Key (gsk_...)"
                  style={{
                    width: '100%',
                    padding: '11px 44px 11px 14px',
                    borderRadius: '6px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: `1px solid ${groqKey ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono, monospace',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowGroqKey(!showGroqKey)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showGroqKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)' }}>
                Provides lightning-fast 500 tokens/second responses via Groq hardware LPU.
              </span>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '4px' }}>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  padding: '12px 28px',
                  borderRadius: '6px',
                  background: '#00f2fe',
                  border: 'none',
                  color: '#000',
                  fontSize: '12px',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 0 20px rgba(0, 242, 254, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{isSaving ? 'SAVING TO .ENV...' : 'SAVE & PERSIST CONFIGURATION'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ================= TAB 2: SYSTEM ARCHITECTURE ================= */}
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
                    {activeProvider.toUpperCase()}
                  </div>
                  <span style={{ fontSize: '9px', color: '#10b981' }}>● PRIMARY ACTIVE</span>
                </div>

                <div style={{ padding: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.35)' }}>ACTIVE MODEL</span>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                    {selectedModel.split('/').pop()}
                  </div>
                  <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.4)' }}>ONLINE</span>
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
                    WebSocket Hub
                  </div>
                  <span style={{ fontSize: '9px', color: '#10b981' }}>● 14ms LATENCY</span>
                </div>
              </div>
            </div>

            {/* Secure VPS Vault Banner */}
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
                    CREDENTIAL VAULT // PERSISTED ON DISK
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('api_keys')}
                  style={{
                    fontSize: '9.5px',
                    color: '#00f2fe',
                    background: 'rgba(0, 242, 254, 0.1)',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  MANAGE KEYS →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '11px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>GOOGLE GEMINI API KEY</span>
                  <span style={{ color: geminiKey ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                    {geminiKey ? '● CONFIGURED & PERSISTED' : '○ KEY REQUIRED'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '11px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>GROQ CLOUD API KEY</span>
                  <span style={{ color: groqKey ? '#10b981' : 'rgba(255, 255, 255, 0.4)', fontWeight: 700 }}>
                    {groqKey ? '● CONFIGURED & PERSISTED' : '○ NOT SET'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 3: DEVICES ================= */}
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

        {/* ================= TAB 4: SECURITY ================= */}
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
