import React from 'react';
import { FolderKanban, Plus, Layers, ArrowUpRight } from 'lucide-react';
import { Project } from '../../types';

interface ProjectsViewProps {
  projects: Project[];
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects }) => {
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
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Projects Command Center</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Central repository of active master projects, repositories, and development milestones.
          </p>
        </div>

        <button className="btn-primary">
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {projects.map((p) => (
          <div
            key={p.id}
            className="glass-panel"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(0, 242, 254, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(0, 242, 254, 0.2)'
                }}>
                  <FolderKanban size={18} color="#00f2fe" />
                </div>
                <div>
                  <h3 style={{ fontSize: '15.5px', fontWeight: 700 }}>{p.name}</h3>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Active Workspace</span>
                </div>
              </div>

              <ArrowUpRight size={18} color="var(--text-muted)" />
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {p.description}
            </p>

            {/* Progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                <span style={{ color: '#00f2fe', fontWeight: 700 }}>{p.progress || 50}%</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${p.progress || 50}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00f2fe 0%, #7928ca 100%)',
                  borderRadius: '3px'
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
