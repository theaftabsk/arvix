import React, { useState } from 'react';
import { Plus, Check, Circle, Flame, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Task } from '../../types';

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onAddTask: (task: Partial<Task>) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks, onToggleTask, onAddTask }) => {
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newDue, setNewDue] = useState('Tomorrow');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      title: newTitle.trim(),
      priority: newPriority,
      status: 'pending',
      due_date: newDue
    });
    setNewTitle('');
    setShowModal(false);
  };

  const pending = tasks.filter(t => t.status === 'pending');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const completed = tasks.filter(t => t.status === 'completed');

  return (
    <div style={{
      flex: 1,
      height: 'calc(100vh - 46px)',
      overflowY: 'auto',
      padding: '28px 40px',
      background: '#030507',
      fontFamily: 'JetBrains Mono, monospace',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      userSelect: 'none'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>
            TASK MATRIX // AUTONOMOUS QUEUE
          </h2>
          <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '2px', display: 'block' }}>
            POSTGRESQL SYNCED // CROSS-DEVICE EXECUTION
          </span>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 14px',
            fontSize: '10.5px',
            fontWeight: 800,
            letterSpacing: '1px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={13} strokeWidth={3} />
          <span>NEW TASK</span>
        </button>
      </div>

      {/* 3-Column HUD Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', flex: 1 }}>
        {/* Pending */}
        <div style={{
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.01)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.8px' }}>
              PENDING [{pending.length}]
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pending.map(t => (
              <div
                key={t.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <button onClick={() => onToggleTask(t.id)} style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.3)', cursor: 'pointer', marginTop: '1px' }}>
                    <Circle size={13} />
                  </button>
                  <span style={{ fontSize: '11.5px', color: '#fff', lineHeight: 1.4 }}>{t.title}</span>
                </div>
                <div style={{ paddingLeft: '21px', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255, 255, 255, 0.4)' }}>
                  <span style={{ color: t.priority === 'urgent' ? '#e11d48' : '#00f2fe' }}>[{t.priority.toUpperCase()}]</span>
                  <span>{t.due_date || 'Upcoming'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div style={{
          borderRadius: '6px',
          border: '1px solid rgba(0, 242, 254, 0.2)',
          background: 'rgba(0, 242, 254, 0.015)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ fontSize: '11px', color: '#00f2fe', fontWeight: 700, letterSpacing: '0.8px' }}>
              IN PROGRESS [{inProgress.length}]
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {inProgress.map(t => (
              <div
                key={t.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                  background: 'rgba(0, 242, 254, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <button onClick={() => onToggleTask(t.id)} style={{ background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', marginTop: '1px' }}>
                    <Clock size={13} />
                  </button>
                  <span style={{ fontSize: '11.5px', color: '#fff', lineHeight: 1.4 }}>{t.title}</span>
                </div>
                <div style={{ paddingLeft: '21px', fontSize: '9px', color: 'rgba(255, 255, 255, 0.4)' }}>
                  ACTIVE EXECUTION
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed */}
        <div style={{
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.01)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, letterSpacing: '0.8px' }}>
              RESOLVED [{completed.length}]
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {completed.map(t => (
              <div
                key={t.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: 0.6
                }}
              >
                <button onClick={() => onToggleTask(t.id)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}>
                  <CheckCircle2 size={13} />
                </button>
                <span style={{ fontSize: '11.5px', textDecoration: 'line-through', color: 'rgba(255, 255, 255, 0.45)' }}>
                  {t.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <form onSubmit={handleCreate} style={{
            width: '420px',
            padding: '24px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: '#030507',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>
              DISPATCH NEW TASK //
            </h3>

            <input
              type="text"
              placeholder="Task Title..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontSize: '12px',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={newPriority}
                onChange={e => setNewPriority(e.target.value as any)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '4px',
                  background: '#080a10',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#00f2fe',
                  fontSize: '11px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="low">LOW PRIORITY</option>
                <option value="medium">MEDIUM PRIORITY</option>
                <option value="high">HIGH PRIORITY</option>
                <option value="urgent">URGENT</option>
              </select>

              <input
                type="text"
                placeholder="Due (e.g. Tomorrow)"
                value={newDue}
                onChange={e => setNewDue(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">
                CANCEL
              </button>
              <button type="submit" className="btn-primary">
                COMMIT TASK
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
