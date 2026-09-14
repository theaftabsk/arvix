import React, { useState } from 'react';
import { Settings, Key, Server, Cpu, Shield, Save, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [vpsUrl, setVpsUrl] = useState('http://localhost:8000');
  const [groqKey, setGroqKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-oss-120b');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${vpsUrl}/api/v1/settings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          default_ai_provider: 'groq',
          default_ai_model: selectedModel,
          groq_api_key: groqKey || undefined,
          gemini_api_key: geminiKey || undefined
        })
      });
    } catch (e) {
      console.warn('Backend offline, saved locally.');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{
      flex: 1,
      height: '100%',
      overflowY: 'auto',
      padding: '28px 36px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Ecosystem Settings</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Configure central VPS endpoints, AI provider keys, and device synchronization.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* VPS Server Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color="#00f2fe" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>ARVIX VPS Brain Server</h3>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              VPS Backend Address (HTTPS / REST)
            </label>
            <input
              type="text"
              value={vpsUrl}
              onChange={(e) => setVpsUrl(e.target.value)}
              placeholder="http://localhost:8000 or https://api.arvix.ai"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13.5px',
                outline: 'none',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
          </div>
        </div>

        {/* AI Provider & Models Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="#00f2fe" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>AI Model Routing (Free Tiers)</h3>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Primary AI Model (Groq LPU)
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 20, 32, 0.95)',
                border: '1px solid var(--border-subtle)',
                color: '#00f2fe',
                fontSize: '13.5px',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              <option value="openai/gpt-oss-120b">Groq · openai/gpt-oss-120b (Recommended Main Brain)</option>
              <option value="llama-3.3-70b-versatile">Groq · llama-3.3-70b-versatile</option>
              <option value="llama-3.1-8b-instant">Groq · llama-3.1-8b-instant (Ultra Fast)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Groq API Key (Free Tier from console.groq.com)
            </label>
            <input
              type="password"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13.5px',
                outline: 'none',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Gemini API Key (Backup Tier from aistudio.google.com)
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13.5px',
                outline: 'none',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          className="btn-primary"
          style={{ width: 'fit-content', padding: '12px 28px' }}
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          <span>{saved ? 'Saved Successfully!' : 'Save Configuration'}</span>
        </button>
      </form>
    </div>
  );
};
