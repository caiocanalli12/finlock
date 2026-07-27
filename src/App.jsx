import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';

export default function App() {
  useEffect(() => {
    // Aplica globalmente o tema que o usuário escolheu na página inicial
    const savedTheme = window.localStorage.getItem('finlock-theme') || 'light';
    document.documentElement.dataset.theme = savedTheme;
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
