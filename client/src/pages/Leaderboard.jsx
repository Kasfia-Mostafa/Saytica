/**
 * ============================================================================
 * LEADERBOARD PAGE COMPONENT
 * ============================================================================
 * 
 * Displays the AI Model Evaluation Leaderboard. 
 * Features include:
 * - Fetching evaluation data from the backend API.
 * - Client-side sorting and filtering (by text search and provider).
 * - Animated rendering of data using GSAP for staggered row entrances.
 * - Interactive Bento-grid stat cards displaying derived metrics.
 * 
 * This component acts as the data-orchestrator for the ModelTable component.
 */

import React, { useState, useEffect, useRef } from 'react';
import { fetchModels } from '../utils/api';
import ModelTable from '../components/ModelTable';
import { FiSearch, FiCpu, FiZap, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import gsap from 'gsap';

/* ── Stat card helper ─────────────────────────────────── */
function StatCard({ icon: Icon, label, value, accent, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.55, delay, ease: 'power3.out' }
    );
  }, [delay]);

  return (
    <div
      ref={ref}
      className="glass glass-hover glass-float stat-card"
      style={{ borderRadius: '16px' }}
    >
      {/* Accent glow orb */}
      <div className="stat-card-accent" style={{ background: accent }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: `${accent}22`, border: `1px solid ${accent}33`,
        }}>
          <Icon size={17} style={{ color: accent }} />
        </div>
      </div>

      <div className="stat-value" style={{ color: accent }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/* ── Leaderboard page ─────────────────────────────────── */
const Leaderboard = () => {
  const [models,         setModels]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [search,         setSearch]         = useState('');
  const [providerFilter, setProviderFilter] = useState('All');
  const [sortConfig,     setSortConfig]     = useState({ key: 'accuracy', direction: 'desc' });

  const headerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchModels();
        setModels(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loading && !error && headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [loading, error]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const providers = ['All', ...new Set(models.map(m => m.provider))];

  const processedModels = (() => {
    let result = [...models];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)
      );
    }
    if (providerFilter !== 'All') result = result.filter(m => m.provider === providerFilter);
    result.sort((a, b) => {
      const { key, direction } = sortConfig;
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  })();

  /* Derived stats */
  const topAccuracy  = models.length ? Math.max(...models.filter(m => m.accuracy).map(m => m.accuracy)) : 0;
  const topModel     = models.find(m => m.accuracy === topAccuracy);
  const avgLatency   = models.length
    ? Math.round(models.filter(m => m.latencyMs && !m.hasLatencyError).reduce((s, m) => s + m.latencyMs, 0) / models.filter(m => m.latencyMs && !m.hasLatencyError).length)
    : 0;
  const freeModels   = models.filter(m => m.costPer1k === 0).length;

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div style={{ paddingBottom: '80px' }}>
        <div style={{ height: '60px', marginTop: '32px', marginBottom: '24px' }} className="skeleton" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '32px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: '110px' }} className="skeleton" />
          ))}
        </div>
        <div style={{ height: '420px' }} className="skeleton" />
      </div>
    );
  }

  if (error) return (
    <div style={{ marginTop: '80px', textAlign: 'center' }}>
      <div className="glass" style={{ padding: '40px', borderRadius: '16px', color: '#f87171' }}>
        Error: {error}
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* ── Page header ── */}
      <div ref={headerRef} style={{ paddingTop: '36px', marginBottom: '28px' }}>
        <div className="page-subtitle" style={{ marginBottom: '8px' }}>
          ◆ AI Model Evaluation Platform
        </div>
        <h1 className="page-title">
          Model{' '}
          <span className="holo-text">Leaderboard</span>
        </h1>
      </div>

      {/* ── Stat cards ── */}
      <div className="bento-3" style={{ marginBottom: '28px' }}>
        <StatCard
          icon={FiTrendingUp}
          label="Top Accuracy"
          value={topModel ? `${(topAccuracy * 100).toFixed(1)}%` : '—'}
          accent="#00d4ff"
          delay={0.05}
        />
        <StatCard
          icon={FiZap}
          label="Avg Latency"
          value={avgLatency ? `${avgLatency} ms` : '—'}
          accent="#7c3aed"
          delay={0.12}
        />
        <StatCard
          icon={FiDollarSign}
          label="Free Models"
          value={freeModels}
          accent="#10b981"
          delay={0.19}
        />
      </div>

      {/* ── Filters row ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '340px' }}>
          <FiSearch
            size={14}
            style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)', pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            id="model-search"
            placeholder="Search models or providers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Provider pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {providers.map(p => (
            <button
              key={p}
              id={`filter-${p.toLowerCase()}`}
              className={`filter-pill${providerFilter === p ? ' active' : ''}`}
              onClick={() => setProviderFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <ModelTable
        models={processedModels}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
    </div>
  );
};

export default Leaderboard;
