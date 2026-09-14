import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Paperclip, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  loading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, loading }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech Recognition if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'bn-BD'; // supports Bengali & English

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this environment.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  const handleSend = () => {
    if (!text.trim() || loading) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      padding: '0 32px 24px 32px',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="glass-panel" style={{
        padding: '8px 12px 8px 16px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(0, 242, 254, 0.25)',
        background: 'rgba(12, 16, 26, 0.85)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 242, 254, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Audio Wave Visualizer when Recording */}
        {isRecording && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            background: 'rgba(255, 0, 128, 0.1)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255, 0, 128, 0.3)'
          }}>
            <div className="wave-bar" />
            <div className="wave-bar" />
            <div className="wave-bar" />
            <div className="wave-bar" />
            <div className="wave-bar" />
            <span style={{ fontSize: '12px', color: '#ff007f', fontWeight: 600, marginLeft: '6px' }}>
              Listening to voice command (বাংলা / English)...
            </span>
          </div>
        )}

        {/* Text Area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message ARVIX... (e.g. 'আজকের AI news বলো' or 'Laptop-এ VS Code খোলো')"
          rows={1}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '14.5px',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            maxHeight: '120px'
          }}
        />

        {/* Action Controls Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '6px'
        }}>
          {/* Quick status pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Sparkles size={12} color="#00f2fe" />
              Groq GPT-OSS 120B (Free Tier)
            </span>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Voice Input Button */}
            <button
              onClick={toggleRecording}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: 'none',
                background: isRecording ? '#ff007f' : 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                boxShadow: isRecording ? '0 0 15px rgba(255, 0, 127, 0.6)' : 'none'
              }}
              title="Speak to ARVIX"
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} color="#00f2fe" />}
            </button>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!text.trim() || loading}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: 'none',
                background: text.trim() && !loading
                  ? 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)'
                  : 'rgba(255, 255, 255, 0.06)',
                color: text.trim() && !loading ? '#05070c' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: text.trim() && !loading ? 'pointer' : 'default',
                transition: 'var(--transition-fast)',
                boxShadow: text.trim() && !loading ? '0 0 15px rgba(0, 242, 254, 0.4)' : 'none'
              }}
              title="Send Message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
