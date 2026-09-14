import React, { useRef, useEffect, useState } from 'react';
import { Send, Volume2, Copy, Check, Terminal, CornerDownLeft, VolumeX, Mic, MicOff } from 'lucide-react';
import { ChatMessage } from '../../types';
import { jarvisVoice } from '../../services/jarvisVoice';

interface RightTranscriptProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (text: string) => void;
  onSpeak: (text: string) => void;
}

export const RightTranscript: React.FC<RightTranscriptProps> = ({
  messages,
  loading,
  onSendMessage,
  onSpeak
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [activeSpeechId, setActiveSpeechId] = useState<string | number | null>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    if (!inputText.trim() || loading) return;
    jarvisVoice.unlockAudio();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleToggleMic = () => {
    jarvisVoice.unlockAudio();
    if (isListening) {
      jarvisVoice.stopContinuousListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      jarvisVoice.startContinuousListening(
        (transcript) => {
          if (transcript && transcript.trim()) {
            setIsListening(false);
            jarvisVoice.unlockAudio();
            onSendMessage(transcript.trim());
          }
        },
        (listening) => {
          setIsListening(listening);
        }
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string | number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayVoice = (id: string | number, content: string) => {
    setActiveSpeechId(id);
    onSpeak(content);
    setTimeout(() => setActiveSpeechId(null), 4000);
  };

  return (
    <aside style={{
      width: '380px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
      background: 'rgba(2, 3, 5, 0.6)',
      fontFamily: 'JetBrains Mono, monospace',
      userSelect: 'none'
    }}>
      {/* Header */}
      <div style={{
        height: '42px',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <span style={{ fontSize: '10.5px', color: '#fff', fontWeight: 700, letterSpacing: '1px' }}>
          TRANSCRIPT
        </span>
        <span style={{
          fontSize: '9px',
          color: '#10b981',
          padding: '1px 6px',
          borderRadius: '3px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          letterSpacing: '0.8px'
        }}>
          LIVE LOG
        </span>
      </div>

      {/* Message Stream */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'rgba(255, 255, 255, 0.25)',
            textAlign: 'center'
          }}>
            <Terminal size={24} strokeWidth={1.5} />
            <span style={{ fontSize: '11px', letterSpacing: '1px' }}>AWAITING COMMAND...</span>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeakingThis = activeSpeechId === msg.id;

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
              >
                {/* Speaker Label */}
                <div style={{
                  fontSize: '9px',
                  color: isUser ? '#00f2fe' : 'rgba(255, 255, 255, 0.4)',
                  marginBottom: '4px',
                  letterSpacing: '1px'
                }}>
                  {isUser ? 'USER // VOICE' : 'ARVIX // SYNAPSE'}
                </div>

                {/* Bubble Container */}
                <div style={{
                  maxWidth: '92%',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  border: isUser
                    ? '1px solid rgba(0, 242, 254, 0.3)'
                    : isSpeakingThis
                    ? '1px solid rgba(0, 242, 254, 0.6)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isUser
                    ? 'rgba(0, 242, 254, 0.04)'
                    : isSpeakingThis
                    ? 'rgba(0, 242, 254, 0.06)'
                    : 'rgba(255, 255, 255, 0.02)',
                  color: '#fff',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  transition: 'all 200ms ease'
                }}>
                  {msg.content}
                </div>

                {/* Sub-actions for Assistant */}
                {!isUser && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', padding: '0 2px' }}>
                    <button
                      onClick={() => handlePlayVoice(msg.id, msg.content)}
                      style={{
                        background: 'rgba(0, 242, 254, 0.08)',
                        border: '1px solid rgba(0, 242, 254, 0.3)',
                        borderRadius: '3px',
                        color: '#00f2fe',
                        cursor: 'pointer',
                        padding: '2px 6px',
                        fontSize: '9.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Play Voice Audio"
                    >
                      <Volume2 size={11} />
                      <span>{isSpeakingThis ? 'PLAYING...' : 'SPEAK'}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      style={{ background: 'none', border: 'none', color: copiedId === msg.id ? '#10b981' : 'rgba(255, 255, 255, 0.4)', cursor: 'pointer' }}
                      title="Copy"
                    >
                      {copiedId === msg.id ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                    <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.25)' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f2fe', fontSize: '11px', padding: '6px' }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#00f2fe' }} />
            <span>PROCESSING NEURAL THREAD...</span>
          </div>
        )}

        <div ref={scrollEndRef} />
      </div>

      {/* Transcript Input Dock */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(2, 3, 5, 0.95)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "LISTENING TO AFTAB..." : "SEND COMMAND //"}
          style={{
            flex: 1,
            background: isListening ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            border: isListening ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '4px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '11.5px',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'all 200ms ease'
          }}
        />

        {/* Live Voice Microphone Button */}
        <button
          onClick={handleToggleMic}
          style={{
            background: isListening ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            color: isListening ? '#10b981' : 'rgba(255, 255, 255, 0.6)',
            border: isListening ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms ease',
            boxShadow: isListening ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none'
          }}
          title={isListening ? "Stop Voice Input" : "Click to Speak (Direct Voice Input)"}
        >
          {isListening ? <Mic size={14} className="animate-pulse" /> : <Mic size={14} />}
        </button>

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || loading}
          style={{
            background: inputText.trim() ? '#00f2fe' : 'rgba(255, 255, 255, 0.06)',
            color: inputText.trim() ? '#000' : 'rgba(255, 255, 255, 0.3)',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: inputText.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms ease'
          }}
        >
          <CornerDownLeft size={13} strokeWidth={2.5} />
        </button>
      </div>
    </aside>
  );
};
