import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Leaderboard from './pages/Leaderboard';
import TaskBoard from './pages/TaskBoard';
import gsap from 'gsap';

function MainContent() {
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [location.pathname]);

  return (
    <main className="max-w-7xl mx-auto px-6 relative z-10" ref={mainRef}>
      <Routes>
        <Route path="/" element={<Leaderboard />} />
        <Route path="/tasks" element={<TaskBoard />} />
      </Routes>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative bg-transparent">
        <Navbar />
        <MainContent />
      </div>
    </BrowserRouter>
  );
}

export default App;
