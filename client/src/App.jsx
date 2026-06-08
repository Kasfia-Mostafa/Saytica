import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Leaderboard from './pages/Leaderboard';
import TaskBoard from './pages/TaskBoard';
import gsap from 'gsap';

/* ─── Animated Particle Canvas ──────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width  = window.innerWidth;
    let height = window.innerHeight;
    canvas.width  = width;
    canvas.height = height;

    const PARTICLE_COUNT = 80;

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:   Math.random() * width,
      y:   Math.random() * height,
      vx:  (Math.random() - 0.5) * 0.3,
      vy:  (Math.random() - 0.5) * 0.3,
      r:   Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      hue: Math.random() > 0.5 ? 195 : 270,   // cyan or violet
    }));

    const CONNECTION_DIST = 130;

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Move
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(${particles[i].hue}, 100%, 70%, ${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${p.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      width  = window.innerWidth;
      height = window.innerHeight;
      canvas.width  = width;
      canvas.height = height;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="particle-canvas"
      aria-hidden="true"
    />
  );
}

/* ─── Cursor Spotlight ──────────────────────────────────────── */
function CursorSpotlight() {
  const spotRef = useRef(null);

  useEffect(() => {
    const el = spotRef.current;
    if (!el) return;

    const onMove = (e) => {
      gsap.to(el, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.8,
        ease: 'power3.out',
      });
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={spotRef}
      id="cursor-spotlight"
      aria-hidden="true"
    />
  );
}

/* ─── Morphing Background Blobs ─────────────────────────────── */
function MorphBlobs() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      <svg
        width="100%" height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <radialGradient id="blob1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,212,255,0.08)" />
            <stop offset="100%" stopColor="rgba(0,212,255,0)" />
          </radialGradient>
          <radialGradient id="blob2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(124,58,237,0.07)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0)" />
          </radialGradient>
          <radialGradient id="blob3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,245,212,0.05)" />
            <stop offset="100%" stopColor="rgba(0,245,212,0)" />
          </radialGradient>
        </defs>

        {/* Blob 1 — Cyan, top left */}
        <ellipse cx="250" cy="300" rx="380" ry="280" fill="url(#blob1)">
          <animateTransform
            attributeName="transform" type="translate"
            values="0,0; 40,30; -20,50; 0,0"
            dur="18s" repeatCount="indefinite"
          />
        </ellipse>

        {/* Blob 2 — Violet, right center */}
        <ellipse cx="1200" cy="450" rx="420" ry="320" fill="url(#blob2)">
          <animateTransform
            attributeName="transform" type="translate"
            values="0,0; -50,20; 30,-40; 0,0"
            dur="22s" repeatCount="indefinite"
          />
        </ellipse>

        {/* Blob 3 — Teal, bottom center */}
        <ellipse cx="700" cy="750" rx="350" ry="200" fill="url(#blob3)">
          <animateTransform
            attributeName="transform" type="translate"
            values="0,0; 20,-40; -30,10; 0,0"
            dur="15s" repeatCount="indefinite"
          />
        </ellipse>
      </svg>
    </div>
  );
}

/* ─── Page transition wrapper ───────────────────────────────── */
function MainContent() {
  const location  = useLocation();
  const mainRef   = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out' }
      );
    }
  }, [location.pathname]);

  return (
    <main className="main-layout" ref={mainRef} style={{ paddingTop: 0 }}>
      <Routes>
        <Route path="/"      element={<Leaderboard />} />
        <Route path="/tasks" element={<TaskBoard />}   />
      </Routes>
    </main>
  );
}

/* ─── Root App ──────────────────────────────────────────────── */
function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        {/* Living background layers */}
        <ParticleCanvas />
        <CursorSpotlight />
        <MorphBlobs />

        {/* UI */}
        <Navbar />
        <MainContent />
      </div>
    </BrowserRouter>
  );
}

export default App;
