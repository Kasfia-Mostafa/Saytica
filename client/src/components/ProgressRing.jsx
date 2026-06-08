import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ProgressRing = ({ radius = 70, stroke = 9, progress = 0 }) => {
  const circleRef  = useRef(null);
  const textRef    = useRef(null);
  const glowRef    = useRef(null);

  const inner       = radius - stroke * 2;
  const circumference = inner * 2 * Math.PI;

  useEffect(() => {
    const offset = circumference - (progress / 100) * circumference;

    // Animate stroke
    gsap.to(circleRef.current, {
      strokeDashoffset: offset,
      duration: 1.6,
      ease: 'power3.out',
    });

    // Animate glow ring too
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        strokeDashoffset: offset,
        duration: 1.6,
        ease: 'power3.out',
      });
    }

    // Count-up number
    const obj = { val: 0 };
    gsap.to(obj, {
      val: progress,
      duration: 1.6,
      ease: 'power3.out',
      onUpdate: () => {
        if (textRef.current) {
          textRef.current.textContent = `${Math.round(obj.val)}%`;
        }
      },
    });
  }, [progress, circumference]);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={radius * 2}
        height={radius * 2}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={radius} cy={radius} r={inner}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={stroke}
        />

        {/* Glow layer (slightly thicker, blurred) */}
        <circle
          ref={glowRef}
          cx={radius} cy={radius} r={inner}
          fill="none"
          stroke="rgba(0,212,255,0.25)"
          strokeWidth={stroke + 4}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          style={{ filter: 'blur(6px)' }}
        />

        {/* Main arc — gradient via linearGradient */}
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#00d4ff" />
            <stop offset="50%"  stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#00f5d4" />
          </linearGradient>
        </defs>

        <circle
          ref={circleRef}
          cx={radius} cy={radius} r={inner}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.7))' }}
        />
      </svg>

      {/* Center text */}
      <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
      }}>
        <span
          ref={textRef}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            lineHeight: 1,
          }}
        >
          0%
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          letterSpacing: '0.12em',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
        }}>
          Done
        </span>
      </div>
    </div>
  );
};

export default ProgressRing;
