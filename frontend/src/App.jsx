import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  useEffect(() => {
    // Auto-initialize default user for seamless Android & web experience
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', 'truthlens-active-session');
      localStorage.setItem('user', JSON.stringify({
        username: 'elak24aid',
        email: 'elak24aid@vetias.ac.in',
        role: 'Verified Investigator'
      }));
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#0b1220] text-slate-100 flex justify-center">
        <main className="w-full max-w-md min-h-screen flex flex-col relative bg-[#0b1220] shadow-2xl overflow-x-hidden">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
