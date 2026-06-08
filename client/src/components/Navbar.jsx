import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { FiBarChart2, FiClipboard } from 'react-icons/fi';
import gsap from 'gsap';

const Navbar = () => {
  const navRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    );
  }, []);

  return (
    <nav className="bg-white border-b border-gray sticky top-0 z-50 shadow-sm" ref={navRef}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        <div className="font-bold text-xl -tracking-wide text-black">
          <span>Saytica Eval</span>
        </div>
        <div className="flex gap-4">
          <NavLink 
            to="/" 
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-sm font-medium text-black transition-all ${
                isActive 
                  ? 'opacity-100 text-accent bg-accent/8' 
                  : 'opacity-70 hover:opacity-100 hover:bg-light'
              }`
            }
          >
            <FiBarChart2 className="text-lg" />
            <span>Leaderboard</span>
          </NavLink>
          <NavLink 
            to="/tasks" 
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-sm font-medium text-black transition-all ${
                isActive 
                  ? 'opacity-100 text-accent bg-accent/8' 
                  : 'opacity-70 hover:opacity-100 hover:bg-light'
              }`
            }
          >
            <FiClipboard className="text-lg" />
            <span>Task Board</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
