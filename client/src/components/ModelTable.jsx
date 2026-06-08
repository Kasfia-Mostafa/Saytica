import React, { useEffect, useRef } from 'react';
import { FiChevronUp, FiChevronDown, FiAlertTriangle } from 'react-icons/fi';
import gsap from 'gsap';

const ModelTable = ({ models, sortConfig, onSort }) => {
  const tableRef = useRef(null);

  // Animate rows on initial render and data change
  useEffect(() => {
    if (models.length > 0 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll('tbody tr');
      gsap.fromTo(
        rows,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [models]);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <span className="inline-block w-3.5" />;
    return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  const getThClass = (key) => {
    const base = 'px-6 py-4 border-b border-light bg-[#FAFAFA] font-semibold text-xs uppercase tracking-widest select-none cursor-pointer transition-colors hover:bg-light';
    const active = sortConfig.key === key ? ' text-accent' : ' text-black';
    return base + active;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-md border border-gray shadow-sm">
      <table className="w-full border-collapse text-left" ref={tableRef}>
        <thead>
          <tr>
            <th onClick={() => onSort('name')} className={getThClass('name')}>
              <div className="flex items-center gap-1">Model {renderSortIcon('name')}</div>
            </th>
            <th onClick={() => onSort('provider')} className={getThClass('provider')}>
              <div className="flex items-center gap-1">Provider {renderSortIcon('provider')}</div>
            </th>
            <th onClick={() => onSort('accuracy')} className={getThClass('accuracy')}>
              <div className="flex items-center gap-1">Accuracy {renderSortIcon('accuracy')}</div>
            </th>
            <th onClick={() => onSort('latencyMs')} className={getThClass('latencyMs')}>
              <div className="flex items-center gap-1">Latency {renderSortIcon('latencyMs')}</div>
            </th>
            <th onClick={() => onSort('costPer1k')} className={getThClass('costPer1k')}>
              <div className="flex items-center gap-1">Cost ($/1k) {renderSortIcon('costPer1k')}</div>
            </th>
            <th onClick={() => onSort('evaluatedAt')} className={getThClass('evaluatedAt')}>
              <div className="flex items-center gap-1">Evaluated {renderSortIcon('evaluatedAt')}</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {models.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center p-12 text-gray-400">No models found matching your criteria.</td>
            </tr>
          ) : (
            models.map((model) => (
              <tr key={model.id} className="transition-colors hover:bg-[#FAFAFA] [&:last-child>td]:border-b-0">
                <td className="px-6 py-4 border-b border-light font-semibold">{model.name}</td>
                <td className="px-6 py-4 border-b border-light">
                  <span className="inline-block bg-light px-2.5 py-0.5 rounded-full text-sm font-medium">{model.provider}</span>
                </td>
                <td className="px-6 py-4 border-b border-light">
                  {model.accuracy !== null ? (
                    <div className="flex flex-col gap-1.5">
                      <span>{(model.accuracy * 100).toFixed(1)}%</span>
                      <div className="w-full max-w-[100px] h-1.5 bg-light rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent rounded-full" 
                          style={{ width: `${model.accuracy * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 border-b border-light">
                  {model.hasLatencyError ? (
                    <span className="text-accent font-semibold flex items-center gap-1">
                      <FiAlertTriangle /> Timeout
                    </span>
                  ) : (
                    `${model.latencyMs} ms`
                  )}
                </td>
                <td className="px-6 py-4 border-b border-light">
                  {model.costPer1k === null ? (
                    <span className="text-gray-400">—</span>
                  ) : model.costPer1k === 0 ? (
                    <span className="inline-block bg-black/5 border border-gray px-2 py-0.5 rounded text-sm font-semibold">Free</span>
                  ) : (
                    `$${model.costPer1k.toFixed(2)}`
                  )}
                </td>
                <td className="px-6 py-4 border-b border-light text-gray-400 text-sm">
                  {model.evaluatedAt || 'Pending'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ModelTable;
