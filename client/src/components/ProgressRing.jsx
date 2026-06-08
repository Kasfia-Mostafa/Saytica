import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ProgressRing = ({ radius = 60, stroke = 8, progress = 0 }) => {
  const circleRef = useRef(null);
  const textRef = useRef(null);
  
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  useEffect(() => {
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    gsap.to(circleRef.current, {
      strokeDashoffset,
      duration: 1.5,
      ease: 'power3.out',
    });

    // Animate the number counting up
    const textObj = { val: 0 };
    gsap.to(textObj, {
      val: progress,
      duration: 1.5,
      ease: 'power3.out',
      onUpdate: () => {
        if (textRef.current) {
          textRef.current.textContent = `${Math.round(textObj.val)}%`;
        }
      }
    });

  }, [progress, circumference]);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="-rotate-90"
      >
        <circle
          stroke="var(--color-light)"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          ref={circleRef}
          className="transition-[stroke-dashoffset] duration-100 ease-linear"
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset: circumference }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute text-2xl font-bold text-black" ref={textRef}>
        0%
      </div>
    </div>
  );
};

export default ProgressRing;
