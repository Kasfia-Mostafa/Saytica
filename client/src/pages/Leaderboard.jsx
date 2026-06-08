import React, { useState, useEffect, useRef } from 'react';
import { fetchModels } from '../utils/api';
import ModelTable from '../components/ModelTable';
import { FiSearch } from 'react-icons/fi';
import gsap from 'gsap';

const Leaderboard = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);

  // Filters and Sorting
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'accuracy', direction: 'desc' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchModels();
        setModels(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && !error && containerRef.current) {
      gsap.from(containerRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all'
      });
    }
  }, [loading, error, models]);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Extract unique providers for the filter pill list
  const providers = ['All', ...new Set(models.map(m => m.provider))];

  // Apply filters & sorting
  const getProcessedModels = () => {
    let result = [...models];

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.provider.toLowerCase().includes(q)
      );
    }

    // Filter by provider
    if (providerFilter !== 'All') {
      result = result.filter(m => m.provider === providerFilter);
    }

    // Sort
    result.sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA = a[key];
      let valB = b[key];

      // Handle nulls: always push them to the bottom
      if (valA === null) return 1;
      if (valB === null) return -1;

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  };

  if (loading) return <div className="mt-16 text-center text-lg text-gray-500">Loading leaderboard...</div>;
  if (error) return <div className="mt-16 text-center text-lg text-accent">Error: {error}</div>;

  const processedModels = getProcessedModels();

  return (
    <div className="pb-16" ref={containerRef}>
      <div className="flex items-center justify-between mb-6 pt-8">
        <h1 className="text-2xl font-bold -tracking-wide text-black">Model Leaderboard</h1>
      </div>

      <div className="flex flex-col gap-6 mb-8 md:flex-row md:justify-between md:items-center">
        <div className="relative w-full max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search models..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2.5 pr-4 pl-10 border border-gray rounded-sm font-sans text-base outline-none bg-light transition-all focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {providers.map(p => (
            <button 
              key={p} 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border border-transparent ${
                providerFilter === p 
                  ? 'bg-black text-white' 
                  : 'bg-light text-gray-600 hover:bg-[#e0e0e0]'
              }`}
              onClick={() => setProviderFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <ModelTable 
        models={processedModels} 
        sortConfig={sortConfig} 
        onSort={handleSort} 
      />
    </div>
  );
};

export default Leaderboard;
