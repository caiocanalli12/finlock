import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Logo() {
  return (
    <div className="logo">
      <span className="logo__mark" aria-hidden="true">
        <span className="logo__slot" />
      </span>
      <span>FinLock</span>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpar estado de auth será feito aqui futuramente
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="sidebar-header">
        <Logo />
      </div>
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          Visão Geral
        </NavLink>
        <NavLink 
          to="/dashboard/investimentos" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          Investimentos
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </aside>
  );
}
