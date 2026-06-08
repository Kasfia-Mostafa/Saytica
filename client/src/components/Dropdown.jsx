import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import gsap from 'gsap';

const Dropdown = ({ options, value, onChange, placeholder = 'Select an option' }) => {
  const [isOpen, setIsOpen]       = useState(false);
  const menuRef                   = useRef(null);
  const containerRef              = useRef(null);
  const chevronRef                = useRef(null);

  const selectedOption = options.find(o => o.value === value);

  // Close on outside click
  useEffect(() => {
    const onOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  // Animate menu open / close
  useEffect(() => {
    if (!menuRef.current) return;
    if (isOpen) {
      menuRef.current.style.display = 'block';
      gsap.fromTo(
        menuRef.current,
        { opacity: 0, y: -8, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'power3.out' }
      );
    } else {
      gsap.to(menuRef.current, {
        opacity: 0, y: -6, scale: 0.97,
        duration: 0.2, ease: 'power2.in',
        onComplete: () => {
          if (menuRef.current) menuRef.current.style.display = 'none';
        },
      });
    }

    // Rotate chevron
    gsap.to(chevronRef.current, {
      rotate: isOpen ? 180 : 0,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block', minWidth: '220px' }}
    >
      {/* Trigger */}
      <button
        id="dropdown-trigger"
        type="button"
        className="cyber-dropdown-btn"
        onClick={() => setIsOpen(o => !o)}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span ref={chevronRef} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <FiChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
        </span>
      </button>

      {/* Menu */}
      <div
        ref={menuRef}
        className="cyber-dropdown-menu"
        style={{ display: 'none' }}
      >
        {options.map(opt => (
          <div
            key={opt.value}
            className={`cyber-dropdown-option${opt.value === value ? ' selected' : ''}`}
            onClick={() => { onChange(opt.value); setIsOpen(false); }}
          >
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dropdown;
