import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { FiBarChart2, FiClipboard, FiZap } from 'react-icons/fi';
import gsap from 'gsap';

const Navbar = () => {
  const navRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // Navbar slide-in
    gsap.fromTo(
      navRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
    );
    // Logo pulse
    gsap.to(logoRef.current, {
      boxShadow: '0 0 30px rgba(0,212,255,0.5)',
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: 'sine.inOut',
    });
  }, []);

  return (
    <nav className="nav-aurora sticky top-0 z-50" ref={navRef}>
      <div className="main-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="logo-mark" ref={logoRef} />
          <div>
            <div className="nav-brand holo-text">SAYTICA</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              letterSpacing: '0.2em',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              lineHeight: 1,
              marginTop: '1px',
            }}>
              Eval Console
            </div>
          </div>
        </div>



        {/* Nav links */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <NavLink
            to="/"
            id="nav-leaderboard"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <FiBarChart2 size={15} />
            <span>Leaderboard</span>
          </NavLink>

          <NavLink
            to="/tasks"
            id="nav-tasks"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <FiClipboard size={15} />
            <span>Task Board</span>
          </NavLink>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
