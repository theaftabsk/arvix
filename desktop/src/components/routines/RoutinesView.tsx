import React from 'react';
import { Clock, Plus, Bell, Calendar, Power } from 'lucide-react';
import { RoutineItem } from '../../types';

interface RoutinesViewProps {
  routines: RoutineItem[];
  onToggleRoutine: (id: number) => void;
}

export const RoutinesView: React.FC<RoutinesViewProps> = ({ routines, onToggleRoutine }) => {
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
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Autonomous Routine Engine</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Scheduled triggers running 24/7 on VPS for morning briefings, news digests, and task checks.
          </p>
        </div>

        <button className="btn-primary">
          <Plus size={16} />
          <span>New Routine</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {routines.map((r, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderLeft: r.is_active ? '3px solid #00f2fe' : '3px solid transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: r.is_active ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: r.is_active ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid var(--border-subtle)'
              }}>
                <Clock size={20} color={r.is_active ? '#00f2fe' : 'var(--text-muted)'} />
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: r.is_active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {r.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                    ⏰ {r.cron_time}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• Action: {r.action_type}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onToggleRoutine(r.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: r.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                color: r.is_active ? '#10b981' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Power size={13} />
              <span>{r.is_active ? 'Active' : 'Disabled'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
