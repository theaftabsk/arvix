import React, { useState, useEffect } from 'react';
import { Brain, Plus, Search, Star, Trash2, Tag, Music, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { MemoryItem } from '../../types';
import { apiService } from '../../services/api';

interface MemoryViewProps {
  memories: MemoryItem[];
  onAddMemory?: (mem: Partial<MemoryItem>) => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({ memories: propMemories, onAddMemory }) => {
  const [items, setItems] = useState<MemoryItem[]>(propMemories || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<string>('personal');

  // Load memories from backend on mount
  const refreshMemories = async () => {
    setLoading(true);
    try {
      const data = await apiService.getMemories();
      setItems(data);
    } catch (e) {
      console.warn('[MemoryView] Refresh error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMemories();
  }, []);

  // Sync if parent updates
  useEffect(() => {
    if (propMemories && propMemories.length > 0) {
      setItems(propMemories);
    }
  }, [propMemories]);

  const filtered = items.filter(m => {
    const matchCat = selectedCategory === 'all' || m.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchText = (m.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchText;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const created = await apiService.createMemory({
        content: newContent.trim(),
        category: newCategory as any,
        importance: 5
      });
      setItems(prev => [created, ...prev]);
      if (onAddMemory) onAddMemory(created);
    } catch (err) {
      console.error('[MemoryView] Add error:', err);
    }

    setNewContent('');
    setShowAddModal(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteMemory(id);
      setItems(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('[MemoryView] Delete error:', err);
    }
  };

  const categories = ['all', 'favorite_song', 'personal', 'preference', 'project', 'fact'];

  return (
    <div style={{
      flex: 1,
      height: '100%',
      overflowY: 'auto',
      padding: '28px 36px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      background: '#04070D',
      color: '#E2E8F0',
      fontFamily: 'JetBrains Mono, monospace'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
              Central Memory Core
            </h2>
            <span style={{
              padding: '2px 8px',
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#00F0FF',
              fontWeight: 600
            }}>
              {items.length} SAVED
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
            Long-term personal knowledge, favorite music, and preferences saved in persistent PostgreSQL.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={refreshMemories}
            disabled={loading}
            style={{
              padding: '9px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '9px 18px',
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(16, 185, 129, 0.25))',
              border: '1px solid #00F0FF',
              color: '#00F0FF',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)'
            }}
          >
            <Plus size={16} />
            <span>Save New Memory</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          flex: 1,
          minWidth: '280px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          background: 'rgba(7, 14, 26, 0.8)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          borderRadius: '8px'
        }}>
          <Search size={16} color="#00F0FF" />
          <input
            type="text"
            placeholder="Search memory graph (e.g. dil, music, preference)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              outline: 'none',
              width: '100%'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                textTransform: 'capitalize',
                padding: '8px 14px',
                background: selectedCategory === cat ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedCategory === cat ? '#00F0FF' : 'rgba(255, 255, 255, 0.6)',
                border: selectedCategory === cat ? '1px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {cat === 'favorite_song' ? '🎵 Favorite Music' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Grid */}
      {filtered.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {filtered.map((m) => {
            const isSong = m.category === 'favorite_song';
            return (
              <div
                key={m.id}
                style={{
                  padding: '18px',
                  background: isSong 
                    ? 'linear-gradient(145deg, rgba(7, 14, 26, 0.9), rgba(245, 158, 11, 0.08))' 
                    : 'rgba(7, 14, 26, 0.8)',
                  border: isSong 
                    ? '1px solid rgba(245, 158, 11, 0.4)' 
                    : '1px solid rgba(0, 240, 255, 0.15)',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  boxShadow: isSong ? '0 0 20px rgba(245, 158, 11, 0.1)' : 'none',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: isSong ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 240, 255, 0.15)',
                    color: isSong ? '#FBBF24' : '#00F0FF',
                    border: isSong ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(0, 240, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {isSong && <Music size={11} />}
                    {isSong ? 'FAVORITE SONG' : m.category}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(m.importance || 4)].map((_, i) => (
                        <Star key={i} size={11} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>

                    <button
                      onClick={() => handleDelete(m.id)}
                      title="Forget this memory"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(239, 68, 68, 0.6)',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p style={{
                  fontSize: '14px',
                  color: '#FFFFFF',
                  lineHeight: '1.6',
                  fontWeight: isSong ? 600 : 400
                }}>
                  {isSong ? `🎶 "${m.content}"` : m.content}
                </p>

                <div style={{
                  fontSize: '10.5px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto'
                }}>
                  <span>MEMORY ID #{m.id}</span>
                  <span>{m.created_at ? new Date(m.created_at).toLocaleDateString() : 'SAVED'}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'rgba(7, 14, 26, 0.4)',
          border: '1px dashed rgba(0, 240, 255, 0.2)',
          borderRadius: '12px'
        }}>
          <Brain size={42} style={{ margin: '0 auto 16px auto', color: '#00F0FF', opacity: 0.6 }} />
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
            কোনো মেমোরি পাওয়া যায়নি
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', maxWidth: '440px', margin: '0 auto 16px auto' }}>
            ARVIX-কে ভয়েসে বলুন: <strong>"আমার প্রিয় গান দিল"</strong> অথবা ওপরের বাটনে ক্লিক করে নতুন মেমোরি সেভ করুন।
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '8px 20px',
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid #00F0FF',
              color: '#00F0FF',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            + মেমোরি যোগ করুন
          </button>
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            background: '#070E1A',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
              Save Fact to Central Memory
            </h3>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#00F0FF', display: 'block', marginBottom: '6px' }}>
                  CATEGORY
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  <option value="favorite_song">🎵 Favorite Song</option>
                  <option value="personal">Personal Fact</option>
                  <option value="preference">User Preference</option>
                  <option value="project">Project Note</option>
                  <option value="fact">General Fact</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#00F0FF', display: 'block', marginBottom: '6px' }}>
                  MEMORY CONTENT
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. গানের নাম দিল, বা প্রিয় খাবার বিরিয়ানি..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(16, 185, 129, 0.3))',
                    border: '1px solid #00F0FF',
                    color: '#00F0FF',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
