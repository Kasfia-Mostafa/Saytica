import React, { useState, useEffect, useRef } from 'react';
import { fetchTasks, updateTaskStatus } from '../utils/api';
import TaskCard from '../components/TaskCard';
import ProgressRing from '../components/ProgressRing';
import Dropdown from '../components/Dropdown';
import gsap from 'gsap';

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Role toggle: 'annotator' or 'client'
  const [role, setRole] = useState('annotator');
  
  // Specific role selectors
  const [activeAnnotator, setActiveAnnotator] = useState('u_annotator');
  const [activeProject, setActiveProject] = useState('p1'); // p1 = Project Atlas, p2 = Project Beta

  const viewContainerRef = useRef(null);

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

  useEffect(() => {
    loadTasks();
  }, []);

  // Animate view transition when role changes
  useEffect(() => {
    if (viewContainerRef.current) {
      gsap.fromTo(
        viewContainerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [role]);

  const handleAdvance = async (taskId, nextStatus) => {
    try {
      // Optimistic UI update
      setTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t)
      );
      // Backend call
      await updateTaskStatus(taskId, nextStatus);
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert on failure by reloading
      loadTasks();
    }
  };

  if (loading) return <div className="mt-16 text-center text-lg text-gray-500">Loading tasks...</div>;

  // Derive Client Data
  const clientTasks = tasks.filter(t => t.projectId === activeProject);
  const cPending = clientTasks.filter(t => t.status === 'pending').length;
  const cInProgress = clientTasks.filter(t => t.status === 'in_progress').length;
  const cDone = clientTasks.filter(t => t.status === 'done').length;
  const cTotal = clientTasks.length;
  const cProgress = cTotal === 0 ? 0 : (cDone / cTotal) * 100;

  // Derive Annotator Data
  const annotatorTasks = tasks.filter(t => t.assignedTo === activeAnnotator);
  const aPending = annotatorTasks.filter(t => t.status === 'pending');
  const aInProgress = annotatorTasks.filter(t => t.status === 'in_progress');
  const aDone = annotatorTasks.filter(t => t.status === 'done');

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between mb-6 pt-8">
        <h1 className="text-2xl font-bold -tracking-wide text-black">Task Board</h1>
        
        {/* Role Toggle Switch */}
        <div className="relative flex bg-light rounded-full p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] w-[216px]">
          <div 
            className="absolute top-1 bottom-1 w-[100px] bg-black rounded-full transition-all duration-300 ease-out shadow-sm"
            style={{ transform: role === 'annotator' ? 'translateX(0)' : 'translateX(108px)' }}
          />
          <button 
            className={`relative z-10 w-[100px] py-2 rounded-full font-semibold text-sm transition-colors duration-300 ${
              role === 'annotator' ? 'text-white' : 'text-gray-500 hover:text-black'
            }`}
            onClick={() => setRole('annotator')}
          >
            Annotator
          </button>
          <button 
            className={`relative z-10 w-[100px] py-2 rounded-full font-semibold text-sm transition-colors duration-300 ${
              role === 'client' ? 'text-white' : 'text-gray-500 hover:text-black'
            }`}
            onClick={() => setRole('client')}
          >
            Client
          </button>
        </div>
      </div>

      <div ref={viewContainerRef}>
        {role === 'annotator' ? (
          <div>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray">
              <h2 className="text-[1.4rem] font-semibold -tracking-wide">Annotator: My Tasks</h2>
              <Dropdown 
                value={activeAnnotator} 
                onChange={setActiveAnnotator}
                options={[
                  { value: 'u_annotator', label: 'Annotator 1 (u_annotator)' },
                  { value: 'u_other', label: 'Annotator 2 (u_other)' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#fafafa] rounded-md p-4 border border-light min-h-[400px]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#6b7280' }} />
                  <h3 className="text-lg font-semibold">Pending ({aPending.length})</h3>
                </div>
                <div>
                  {aPending.map(t => (
                    <TaskCard key={t.id} task={t} isClientView={false} onAdvance={handleAdvance} />
                  ))}
                  {aPending.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm italic border border-dashed border-gray rounded-sm">No tasks</div>
                  )}
                </div>
              </div>

              <div className="bg-[#fafafa] rounded-md p-4 border border-light min-h-[400px]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                  <h3 className="text-lg font-semibold">In Progress ({aInProgress.length})</h3>
                </div>
                <div>
                  {aInProgress.map(t => (
                    <TaskCard key={t.id} task={t} isClientView={false} onAdvance={handleAdvance} />
                  ))}
                  {aInProgress.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm italic border border-dashed border-gray rounded-sm">No tasks</div>
                  )}
                </div>
              </div>

              <div className="bg-[#fafafa] rounded-md p-4 border border-light min-h-[400px]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10b981' }} />
                  <h3 className="text-lg font-semibold">Done ({aDone.length})</h3>
                </div>
                <div>
                  {aDone.map(t => (
                    <TaskCard key={t.id} task={t} isClientView={false} onAdvance={handleAdvance} />
                  ))}
                  {aDone.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm italic border border-dashed border-gray rounded-sm">No tasks</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray">
              <h2 className="text-[1.4rem] font-semibold -tracking-wide">Client: Project Summary</h2>
              <Dropdown 
                value={activeProject} 
                onChange={setActiveProject}
                options={[
                  { value: 'p1', label: 'Project Atlas (c1)' },
                  { value: 'p2', label: 'Project Beta (c2)' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 mb-8">
              <div className="bg-white border border-gray rounded-md p-6 shadow-sm flex flex-col items-center min-w-[250px]">
                <h3 className="text-lg font-semibold mb-6">Overall Progress</h3>
                <ProgressRing progress={cProgress} radius={70} stroke={10} />
              </div>

              <div className="bg-white border border-gray rounded-md p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-lg font-semibold mb-6">Task Counts</h3>
                <div className="flex justify-between items-center p-3 bg-light rounded-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#6b7280' }} />
                    <span>Pending</span>
                  </div>
                  <span className="text-xl font-bold">{cPending}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-light rounded-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                    <span>In Progress</span>
                  </div>
                  <span className="text-xl font-bold">{cInProgress}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-light rounded-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10b981' }} />
                    <span>Done</span>
                  </div>
                  <span className="text-xl font-bold">{cDone}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl mb-4">All Tasks ({cTotal})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientTasks.map(t => (
                  <TaskCard key={t.id} task={t} isClientView={true} />
                ))}
                {clientTasks.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm italic border border-dashed border-gray rounded-sm">No tasks in project.</div>
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
