import React, { useRef } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import gsap from 'gsap';

const TaskCard = ({ task, isClientView, onAdvance }) => {
  const cardRef = useRef(null);

  const handleAdvance = () => {
    if (!onAdvance || isClientView) return;
    
    const nextStatus = task.status === 'pending' ? 'in_progress' : 'done';
    
    // Animate out, then call parent
    gsap.to(cardRef.current, {
      x: 30,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        onAdvance(task.id, nextStatus);
        // Parent will re-render in new column, reset inline styles
        gsap.set(cardRef.current, { x: 0, opacity: 1 });
      }
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'done': return '#10b981'; // Green
      case 'in_progress': return '#f59e0b'; // Yellow/Orange
      default: return '#6b7280'; // Gray (pending)
    }
  };

  return (
    <div
      className="bg-white border border-gray rounded-md p-4 mb-3 shadow-sm transition-all duration-200 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md"
      ref={cardRef}
    >
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold uppercase tracking-widest bg-light px-2 py-0.5 rounded text-gray-500">
          {task.projectName}
        </span>
        <div 
          className="w-2.5 h-2.5 rounded-full" 
          style={{ backgroundColor: getStatusColor(task.status) }}
          title={task.status.replace('_', ' ')}
        />
      </div>
      
      <h4 className="text-base font-medium leading-relaxed text-black">{task.title}</h4>
      
      {isClientView && (
        <div className="text-sm text-gray-500 bg-[#fafafa] p-1.5 rounded-sm mt-auto">
          Assigned to: <strong>{task.assignedTo || 'Unassigned'}</strong>
        </div>
      )}

      {!isClientView && task.status !== 'done' && (
        <button
          className="mt-auto self-start flex items-center gap-2 text-sm font-semibold text-accent px-3 py-1.5 rounded-sm bg-accent/8 transition-colors hover:bg-accent/15"
          onClick={handleAdvance}
        >
          <span>Advance</span>
          <FiArrowRight />
        </button>
      )}
    </div>
  );
};

export default TaskCard;
