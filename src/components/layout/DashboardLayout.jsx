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
          top: '32px',
          left: '32px',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--primary)',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0, 38, 38, 0.3)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.1s',
          opacity: isSidebarOpen ? 0 : 1,
          pointerEvents: isSidebarOpen ? 'none' : 'auto'
        }}
        onMouseEnter={(e) => { 
          if (!isSidebarOpen) {
            e.currentTarget.style.transform = 'translateY(-4px)'; 
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 38, 38, 0.4)'; 
          }
        }}
        onMouseLeave={(e) => { 
          if (!isSidebarOpen) {
            e.currentTarget.style.transform = 'translateY(0)'; 
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 38, 38, 0.3)'; 
          }
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
