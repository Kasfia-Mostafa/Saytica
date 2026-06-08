import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import gsap from 'gsap';

const Dropdown = ({ options, value, onChange, placeholder = 'Select an option' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    // Close dropdown if clicked outside
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        menuRef.current,
        { opacity: 0, y: -10, display: 'none' },
        { opacity: 1, y: 0, display: 'block', duration: 0.3, ease: 'power2.out' }
      );
    } else {
      gsap.to(menuRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          if (menuRef.current) {
            menuRef.current.style.display = 'none';
          }
        }
      });
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left min-w-[200px]" ref={containerRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full py-2 px-4 rounded-sm border border-gray bg-white font-sans text-base outline-none cursor-pointer hover:border-accent transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <FiChevronDown 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : 'text-gray-500'}`} 
        />
      </button>

      <div
        ref={menuRef}
        className="absolute z-50 w-full mt-1 bg-white border border-gray rounded-sm shadow-lg overflow-hidden hidden origin-top"
      >
        <ul className="max-h-60 overflow-auto py-1">
          {options.map((option) => (
            <li
              key={option.value}
              className={`px-4 py-2 cursor-pointer transition-colors ${
                option.value === value
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-black hover:bg-light'
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dropdown;
