/**
 * ============================================================================
 * TASK BOARD PAGE COMPONENT
 * ============================================================================
 * 
 * Manages the workflow for AI data annotation tasks.
 * Provides two distinct views toggled by the user's role:
 * 
 * 1. Annotator View: A Kanban-style board showing tasks assigned to a specific
 *    user. Allows moving tasks between 'Pending', 'In Progress', and 'Done'.
 *    Features optimistic UI updates for instant feedback.
 * 
 * 2. Client View: A high-level project summary dashboard displaying progress
 *    rings, aggregated task counts, and a grid view of all tasks in a project.
 * 
 * Relies on the backend API for persistent state management.
 */

import React, { useState, useEffect, useRef } from 'react';
import { fetchTasks, updateTaskStatus } from '../utils/api';
import TaskCard from '../components/TaskCard';
import ProgressRing from '../components/ProgressRing';
import Dropdown from '../components/Dropdown';
import { FiLayers, FiUser } from 'react-icons/fi';
import gsap from 'gsap';

/* ── Column colours ─────────────────────────────── */
const COLS = [
  { key: 'pending',     label: 'Queue',       dot: '#475569', accentBg: 'rgba(71,85,105,0.08)',  accentBorder: 'rgba(71,85,105,0.15)'  },
  { key: 'in_progress', label: 'Active',       dot: '#f59e0b', accentBg: 'rgba(245,158,11,0.06)', accentBorder: 'rgba(245,158,11,0.15)' },
  { key: 'done',        label: 'Completed',    dot: '#10b981', accentBg: 'rgba(16,185,129,0.06)', accentBorder: 'rgba(16,185,129,0.15)' },
];

/* ── Kanban column ──────────────────────────────── */
function KanbanColumn({ col, tasks, onAdvance }) {
  return (
    <div
      className="glass kanban-column"
      style={{
        borderRadius: '16px',
        background: col.accentBg,
        borderColor: col.accentBorder,
      }}
    >
      <div className="column-header">
        <span className="column-dot" style={{ background: col.dot, boxShadow: `0 0 8px ${col.dot}88` }} />
        <span style={{ color: 'var(--color-text-primary)', letterSpacing: '0.08em' }}>{col.label}</span>
        <span className="count-badge">{tasks.length}</span>
      </div>

      <div style={{ padding: '4px 0 12px', flex: 1 }}>
        {tasks.map(t => (
          <TaskCard
            key={t.id}
            task={t}
            isClientView={false}
            onAdvance={onAdvance}
          />
        ))}
        {tasks.length === 0 && (
          <div className="empty-state" style={{ margin: '12px' }}>
            No tasks here
          </div>
        )}
      </div>
    </div>
  );
}

/* ── TaskBoard page ─────────────────────────────── */
const TaskBoard = () => {
  const [tasks,           setTasks]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [role,            setRole]            = useState('annotator');
  const [activeAnnotator, setActiveAnnotator] = useState('u_annotator');
  const [activeProject,   setActiveProject]   = useState('p1');

  const viewRef   = useRef(null);
  const headerRef = useRef(null);

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  // Animate view on role change
  useEffect(() => {
    if (viewRef.current) {
      gsap.fromTo(
        viewRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [role]);

  // Header animation
  useEffect(() => {
    if (!loading && headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [loading]);

  const handleAdvance = async (taskId, nextStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));
    try {
      await updateTaskStatus(taskId, nextStatus);
    } catch {
      loadTasks();
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ paddingBottom: '80px' }}>
        <div style={{ height: '60px', marginTop: '32px', marginBottom: '28px' }} className="skeleton" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '420px' }} className="skeleton" />)}
        </div>
      </div>
    );
  }

  /* Derive data */
  const annotatorTasks = tasks.filter(t => t.assignedTo === activeAnnotator);
  const aPending    = annotatorTasks.filter(t => t.status === 'pending');
  const aInProgress = annotatorTasks.filter(t => t.status === 'in_progress');
  const aDone       = annotatorTasks.filter(t => t.status === 'done');

  const clientTasks = tasks.filter(t => t.projectId === activeProject);
  const cPending    = clientTasks.filter(t => t.status === 'pending').length;
  const cInProgress = clientTasks.filter(t => t.status === 'in_progress').length;
  const cDone       = clientTasks.filter(t => t.status === 'done').length;
  const cTotal      = clientTasks.length;
  const cProgress   = cTotal === 0 ? 0 : (cDone / cTotal) * 100;

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* ── Page header ── */}
      <div ref={headerRef} style={{ paddingTop: '36px', marginBottom: '28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="page-subtitle" style={{ marginBottom: '8px' }}>
            ◆ Workflow Management
          </div>
          <h1 className="page-title">
            Task{' '}
            <span className="holo-text">Board</span>
          </h1>
        </div>

        {/* Role toggle */}
        <div className="role-toggle">
          <div
            className="role-slider"
            style={{ transform: role === 'annotator' ? 'translateX(0)' : 'translateX(100%)' }}
          />
          <button
            id="role-annotator"
            className="role-btn"
            style={{ color: role === 'annotator' ? 'var(--color-aurora-cyan)' : 'var(--color-text-muted)' }}
            onClick={() => setRole('annotator')}
          >
            <FiUser size={12} style={{ display: 'inline', marginRight: '5px' }} />
            Annotator
          </button>
          <button
            id="role-client"
            className="role-btn"
            style={{ color: role === 'client' ? 'var(--color-aurora-cyan)' : 'var(--color-text-muted)' }}
            onClick={() => setRole('client')}
          >
            <FiLayers size={12} style={{ display: 'inline', marginRight: '5px' }} />
            Client
          </button>
        </div>
      </div>

      {/* ── Views ── */}
      <div ref={viewRef}>

        {/* ══ ANNOTATOR VIEW ══ */}
        {role === 'annotator' && (
          <div>
            {/* Sub-header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                color: 'var(--color-text-secondary)', letterSpacing: '0.08em',
              }}>
                Viewing tasks for{' '}
                <span style={{ color: 'var(--color-aurora-cyan)' }}>
                  {activeAnnotator === 'u_annotator' ? 'Annotator 1' : 'Annotator 2'}
                </span>
              </div>
              <Dropdown
                value={activeAnnotator}
                onChange={setActiveAnnotator}
                options={[
                  { value: 'u_annotator', label: 'Annotator 1 (u_annotator)' },
                  { value: 'u_other',     label: 'Annotator 2 (u_other)' },
                ]}
              />
            </div>

            {/* Kanban */}
            <div className="bento-3">
              {[
                { ...COLS[0], tasks: aPending },
                { ...COLS[1], tasks: aInProgress },
                { ...COLS[2], tasks: aDone },
              ].map(col => (
                <KanbanColumn
                  key={col.key}
                  col={col}
                  tasks={col.tasks}
                  onAdvance={handleAdvance}
                />
              ))}
            </div>
          </div>
        )}

        {/* ══ CLIENT VIEW ══ */}
        {role === 'client' && (
          <div>
            {/* Sub-header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                color: 'var(--color-text-secondary)', letterSpacing: '0.08em',
              }}>
                Project overview for{' '}
                <span style={{ color: 'var(--color-aurora-cyan)' }}>
                  {activeProject === 'p1' ? 'Project Atlas' : 'Project Beta'}
                </span>
              </div>
              <Dropdown
                value={activeProject}
                onChange={setActiveProject}
                options={[
                  { value: 'p1', label: 'Project Atlas (c1)' },
                  { value: 'p2', label: 'Project Beta (c2)'  },
                ]}
              />
            </div>

            {/* Summary bento */}
            <div className="bento-2" style={{ marginBottom: '28px' }}>

              {/* Progress ring card */}
              <div
                className="glass gradient-border"
                style={{
                  borderRadius: '16px', padding: '28px 32px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                  minWidth: '220px',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.75rem',
                  letterSpacing: '0.1em', color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                }}>
                  Overall Progress
                </div>
                <ProgressRing progress={cProgress} radius={72} stroke={9} />
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                  color: 'var(--color-text-muted)',
                }}>
                  {cDone} of {cTotal} tasks
                </div>
              </div>

              {/* Task counts */}
              <div className="glass" style={{ borderRadius: '16px', padding: '24px' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.75rem',
                  letterSpacing: '0.1em', color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase', marginBottom: '20px',
                }}>
                  Task Breakdown
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Queue',     count: cPending,    color: '#475569' },
                    { label: 'Active',    count: cInProgress, color: '#f59e0b' },
                    { label: 'Completed', count: cDone,       color: '#10b981' },
                  ].map(row => (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: row.color, boxShadow: `0 0 8px ${row.color}88`,
                          flexShrink: 0,
                        }} />
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                          color: 'var(--color-text-secondary)', letterSpacing: '0.06em',
                        }}>
                          {row.label}
                        </span>
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontSize: '1.35rem',
                        fontWeight: 700, color: row.color,
                      }}>
                        {row.count}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Mini progress bar */}
                <div style={{ marginTop: '20px' }}>
                  <div style={{
                    height: '4px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${cProgress}%`,
                      background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
                      borderRadius: '10px',
                      boxShadow: '0 0 8px rgba(0,212,255,0.5)',
                      transition: 'width 1s cubic-bezier(0.23,1,0.32,1)',
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* All tasks grid */}
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                color: 'var(--color-text-muted)', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '14px',
              }}>
                All Tasks — {cTotal}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px',
              }}>
                {clientTasks.map(t => (
                  <TaskCard key={t.id} task={t} isClientView={true} />
                ))}
                {clientTasks.length === 0 && (
                  <div className="empty-state">No tasks in this project.</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TaskBoard;
