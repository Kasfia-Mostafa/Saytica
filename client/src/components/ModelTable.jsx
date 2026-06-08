import React, { useEffect, useRef } from 'react';
import { FiChevronUp, FiChevronDown, FiAlertTriangle, FiAward } from 'react-icons/fi';
import gsap from 'gsap';

/* Provider colour palette */
const PROVIDER_COLORS = {
  OpenAI:    { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)',  text: '#10b981' },
  Anthropic: { bg: 'rgba(224,64,251,0.08)',  border: 'rgba(224,64,251,0.25)',  text: '#e040fb' },
  Google:    { bg: 'rgba(59,130,246,0.08)',   border: 'rgba(59,130,246,0.25)',  text: '#3b82f6' },
  Meta:      { bg: 'rgba(0,212,255,0.08)',    border: 'rgba(0,212,255,0.25)',   text: '#00d4ff' },
  Mistral:   { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)',  text: '#f59e0b' },
  Default:   { bg: 'rgba(124,58,237,0.08)',   border: 'rgba(124,58,237,0.25)',  text: '#9d4edd' },
};

function getProviderStyle(provider) {
  return PROVIDER_COLORS[provider] || PROVIDER_COLORS.Default;
}

function getRankBadgeClass(rank) {
  if (rank === 1) return 'rank-badge gold';
  if (rank === 2) return 'rank-badge silver';
  if (rank === 3) return 'rank-badge bronze';
  return 'rank-badge';
}

const ModelTable = ({ models, sortConfig, onSort }) => {
  const tableRef = useRef(null);
  const wrapRef  = useRef(null);

  useEffect(() => {
    if (models.length > 0 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll('tbody tr');
      gsap.fromTo(
        rows,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.45, stagger: 0.04, ease: 'power3.out' }
      );
    }
  }, [models]);

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <span style={{ display: 'inline-block', width: '12px' }} />;
    return sortConfig.direction === 'asc'
      ? <FiChevronUp size={11} style={{ marginLeft: 3 }} />
      : <FiChevronDown size={11} style={{ marginLeft: 3 }} />;
  };

  const thStyle = (col) => ({
    cursor: 'pointer',
    color: sortConfig.key === col ? 'var(--color-aurora-cyan)' : undefined,
    userSelect: 'none',
    whiteSpace: 'nowrap',
  });

  return (
    <div
      ref={wrapRef}
      className="glass gradient-border"
      style={{ borderRadius: '16px', overflow: 'hidden' }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table className="holo-table" ref={tableRef}>
          <thead>
            <tr>
              <th style={{ paddingLeft: '24px', width: '48px' }}>#</th>
              <th style={thStyle('name')} onClick={() => onSort('name')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Model <SortIcon col="name" />
                </div>
              </th>
              <th style={thStyle('provider')} onClick={() => onSort('provider')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Provider <SortIcon col="provider" />
                </div>
              </th>
              <th style={thStyle('accuracy')} onClick={() => onSort('accuracy')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Accuracy <SortIcon col="accuracy" />
                </div>
              </th>
              <th style={thStyle('latencyMs')} onClick={() => onSort('latencyMs')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Latency <SortIcon col="latencyMs" />
                </div>
              </th>
              <th style={thStyle('costPer1k')} onClick={() => onSort('costPer1k')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Cost / 1k <SortIcon col="costPer1k" />
                </div>
              </th>
              <th style={thStyle('evaluatedAt')} onClick={() => onSort('evaluatedAt')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Evaluated <SortIcon col="evaluatedAt" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {models.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div className="empty-state" style={{ border: 'none' }}>
                    <FiAward size={28} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    No models found matching your criteria.
                  </div>
                </td>
              </tr>
            ) : (
              models.map((model, idx) => {
                const rank = idx + 1;
                const ps   = getProviderStyle(model.provider);

                return (
                  <tr key={model.id}>
                    {/* Rank */}
                    <td style={{ paddingLeft: '24px' }}>
                      <div className={getRankBadgeClass(rank)}>
                        {rank <= 3
                          ? <FiAward size={11} />
                          : <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>{rank}</span>
                        }
                      </div>
                    </td>

                    {/* Model name */}
                    <td>
                      <span style={{
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.88rem',
                      }}>
                        {model.name}
                      </span>
                    </td>

                    {/* Provider */}
                    <td>
                      <span
                        className="provider-badge"
                        style={{
                          background: ps.bg,
                          borderColor: ps.border,
                          color: ps.text,
                        }}
                      >
                        {model.provider}
                      </span>
                    </td>

                    {/* Accuracy */}
                    <td>
                      {model.accuracy !== null ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--color-text-primary)',
                          }}>
                            {(model.accuracy * 100).toFixed(1)}%
                          </span>
                          <div className="accuracy-bar-track">
                            <div
                              className="accuracy-bar-fill"
                              style={{ width: `${model.accuracy * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted mono" style={{ fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>

                    {/* Latency */}
                    <td>
                      {model.hasLatencyError ? (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          color: '#f87171', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                        }}>
                          <FiAlertTriangle size={12} /> Timeout
                        </span>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                          {model.latencyMs} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>ms</span>
                        </span>
                      )}
                    </td>

                    {/* Cost */}
                    <td>
                      {model.costPer1k === null ? (
                        <span className="text-muted mono" style={{ fontSize: '0.8rem' }}>—</span>
                      ) : model.costPer1k === 0 ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          padding: '2px 8px', borderRadius: '6px',
                          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                          color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                        }}>
                          FREE
                        </span>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                          ${model.costPer1k.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Evaluated At */}
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {model.evaluatedAt || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {models.length > 0 && (
        <div style={{
          padding: '10px 24px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
            {models.length} models indexed
          </span>
        </div>
      )}
    </div>
  );
};

export default ModelTable;
