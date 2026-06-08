import React, { useRef } from 'react';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import gsap from 'gsap';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     dotClass: 'status-dot pending',     color: '#475569' },
  in_progress: { label: 'In Progress', dotClass: 'status-dot in_progress', color: '#f59e0b' },
  done:        { label: 'Done',        dotClass: 'status-dot done',        color: '#10b981' },
};

const TaskCard = ({ task, isClientView, onAdvance }) => {
  const cardRef = useRef(null);

  const handleAdvance = () => {
    if (!onAdvance || isClientView || task.status === 'done') return;
    const nextStatus = task.status === 'pending' ? 'in_progress' : 'done';
    gsap.to(cardRef.current, {
      x: 24,
      opacity: 0,
      scale: 0.97,
      duration: 0.28,
      ease: 'power2.in',
      onComplete: () => {
        onAdvance(task.id, nextStatus);
        gsap.set(cardRef.current, { x: 0, opacity: 1, scale: 1 });
      },
    });
  };

  const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;

  return (
    <div className="task-card" ref={cardRef}>
      {/* Top row: project tag + status dot */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="task-project-tag">{task.projectName}</span>
        <span className={sc.dotClass} title={sc.label} />
      </div>

      {/* Title */}
      <p className="task-title">{task.title}</p>

      {/* Client view: assigned to */}
      {isClientView && (
        <div style={{
          fontSize: '0.72rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          padding: '6px 10px',
          borderRadius: '6px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          Assigned →{' '}
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {task.assignedTo || 'Unassigned'}
          </span>
        </div>
      )}

      {/* Advance button */}
      {!isClientView && task.status !== 'done' && (
        <button
          id={`advance-${task.id}`}
          className="advance-btn"
          onClick={handleAdvance}
        >
          {task.status === 'pending' ? 'Start' : 'Complete'}
          <FiArrowRight size={12} />
        </button>
      )}

      {/* Done indicator */}
      {task.status === 'done' && !isClientView && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          fontSize: '0.72rem', fontFamily: 'var(--font-mono)',
          color: '#10b981', fontWeight: 600, letterSpacing: '0.06em',
        }}>
          <FiCheck size={11} /> COMPLETE
        </div>
      )}
    </div>
  );
};

export default TaskCard;
