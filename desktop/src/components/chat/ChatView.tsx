import React, { useRef, useEffect } from 'react';
import { 
  Bot, 
  User, 
  Sparkles, 
  Volume2, 
  Copy, 
  Check, 
  Terminal, 
  Zap,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { jarvisVoice } from '../../services/jarvisVoice';

interface ChatViewProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendPrompt: (prompt: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ messages, loading, onSendPrompt }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | number | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleCopy = (id: string | number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = (text: string) => {
    jarvisVoice.speak(text);
  };

  const quickPrompts = [
    { title: "AI News Briefing", desc: "আজকের গুরুত্বপূর্ণ এআই খবর বলো", query: "আজকের AI news বলো" },
    { title: "Task Agenda", desc: "আমার আগামীকালের কাজ কী কী আছে?", query: "আমার আগামীকালের pending task গুলো বলো" },
    { title: "Laptop Action", desc: "ল্যাপটপে VS Code চালু করো", query: "ARVIX, laptop-এ VS Code open করো" },
    { title: "Memory Engine", desc: "আমার নতুন প্রজেক্টের স্ট্যাক মনে রাখো", query: "মনে রাখো আমার ARVIX প্রজেক্টের মেইন মডেল হলো Groq GPT-OSS 120B" }
  ];

  return (
    <div style={{
      flex: 1,
      height: '100%',
      overflowY: 'auto',
      padding: '24px 32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {messages.length === 0 ? (
        /* Empty State / JARVIS Welcome Hero */
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '28px',
          textAlign: 'center',
          maxWidth: '720px',
          margin: '0 auto',
          paddingBottom: '40px'
        }}>
          {/* Glowing Animated ARVIX Orb */}
          <div style={{ position: 'relative', width: '90px', height: '90px' }}>
            <div className="arvix-orb" style={{ width: '100%', height: '100%' }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={38} color="#ffffff" />
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Good day, Master. <span className="gradient-text-cyan">ARVIX Core Online.</span>
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '520px', lineHeight: 1.6 }}>
              আপনার পার্সোনাল সেন্ট্রাল ব্রেন প্রস্তুত। Groq GPT-OSS 120B মডেল, মেমোরি কোর এবং ল্যাপটপ-মোবাইল সিঙ্ক সম্পূর্ণ সক্রিয়।
            </p>
          </div>

          {/* Suggestion Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            width: '100%'
          }}>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onSendPrompt(p.query)}
                className="glass-panel"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '6px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(16, 20, 32, 0.65)',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-md)',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 242, 254, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={15} color="#00f2fe" />
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.title}</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Messages Stream */
        messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '14px',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                width: '100%',
                maxWidth: '900px',
                margin: isUser ? '0 0 0 auto' : '0 auto 0 0'
              }}
            >
              {/* Bot Avatar */}
              {!isUser && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'radial-gradient(circle, #00f2fe 0%, #7928ca 80%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)'
                }}>
                  <Bot size={20} color="#fff" />
                </div>
              )}

              {/* Message Bubble Container */}
              <div style={{
                maxWidth: '78%',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: isUser ? 'flex-end' : 'flex-start'
              }}>
                {/* Intent & Tool Tags for Assistant */}
                {!isUser && msg.tools && msg.tools.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {msg.tools.map((t, idx) => (
                      <span key={idx} style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(0, 242, 254, 0.12)',
                        border: '1px solid rgba(0, 242, 254, 0.25)',
                        color: '#00f2fe',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Terminal size={10} /> Tool: {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bubble */}
                <div style={{
                  padding: '14px 18px',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isUser 
                    ? 'linear-gradient(135deg, #0072ff 0%, #00c6ff 100%)' 
                    : 'rgba(18, 23, 38, 0.85)',
                  border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(16px)',
                  color: isUser ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '14.5px',
                  lineHeight: 1.6,
                  wordBreak: 'break-word',
                  boxShadow: isUser 
                    ? '0 4px 20px rgba(0, 198, 255, 0.25)' 
                    : '0 4px 20px rgba(0, 0, 0, 0.3)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>

                {/* Actions & Timestamp */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  padding: '0 4px'
                }}>
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <>
                      <button
                        onClick={() => speakText(msg.content)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px'
                        }}
                        title="Speak response"
                      >
                        <Volume2 size={13} />
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedId === msg.id ? '#10b981' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px'
                        }}
                        title="Copy content"
                      >
                        {copiedId === msg.id ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* User Avatar */}
              {isUser && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7928ca 0%, #ff0080 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 15px rgba(121, 40, 202, 0.3)'
                }}>
                  <User size={20} color="#fff" />
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Loading Indicator Orb */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'radial-gradient(circle, #00f2fe 0%, #7928ca 80%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={19} color="#fff" />
          </div>
          <div className="glass-panel" style={{
            padding: '10px 18px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div className="wave-bar" style={{ animationDelay: '0.1s' }} />
            <div className="wave-bar" style={{ animationDelay: '0.2s' }} />
            <div className="wave-bar" style={{ animationDelay: '0.3s' }} />
            <span style={{ fontSize: '13px', color: '#00f2fe', fontWeight: 600, marginLeft: '4px' }}>
              Groq LPU Reasoning...
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
