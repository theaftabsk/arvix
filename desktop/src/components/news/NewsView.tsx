import React, { useState } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';
import { NewsArticle } from '../../types';

interface NewsViewProps {
  articles: NewsArticle[];
}

export const NewsView: React.FC<NewsViewProps> = ({ articles }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Intelligence & Breakthroughs</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Realtime artificial intelligence, engineering, and tech news curated by VPS web agent.
          </p>
        </div>

        <button onClick={handleRefresh} className="btn-ghost" style={{ gap: '8px' }}>
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh Feed</span>
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        {articles.map((item, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(0, 242, 254, 0.15)',
                  color: '#00f2fe'
                }}>
                  {item.source}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.time}</span>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                {item.title}
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {item.summary}
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: '12px'
            }}>
              <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> AI Summarized
              </span>
              <button style={{
                background: 'none',
                border: 'none',
                color: '#00f2fe',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                Read Source <ExternalLink size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
