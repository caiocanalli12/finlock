import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './dashboard.css';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Botão flutuante do menu */}
      <button 
        onClick={toggleSidebar}
        title={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          zIndex: 10000,
          background: 'var(--bg-secondary)',
          border: 'none',
          borderRadius: '50%',
          width: '52px',
          height: '52px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isSidebarOpen ? 0 : 1, // Esconde quando aberto para não sobrepor a logo da sidebar
          pointerEvents: isSidebarOpen ? 'none' : 'auto',
          color: 'var(--text-main)'
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      {isSidebarOpen && (
        <div 
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 9998,
            animation: 'fadeIn 0.3s ease'
          }}
        />
      )}

      <div className="main-content">
        <Header toggleSidebar={toggleSidebar} />
        <main className="dashboard-outlet">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
