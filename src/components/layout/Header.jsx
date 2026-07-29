import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header({ toggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const nextThemeLabel = theme === 'dark' ? 'modo claro' : 'modo escuro';

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button 
          className="menu-hamburger" 
          onClick={toggleSidebar}
          aria-label="Alternar menu"
        >
          <span />
          <span />
          <span />
        </button>
        <div className="header-greeting">
          Olá, Utilizador
        </div>
      </div>
      <div className="header-actions">
        <button
          className="theme-toggle"
          type="button"
          aria-label={`Alternar para ${nextThemeLabel}`}
          aria-pressed={theme === 'dark'}
          onClick={toggleTheme}
        >
          <span aria-hidden="true" />
          {theme === 'dark' ? 'Claro' : 'Escuro'}
        </button>
        <button 
          className="button button--primary" 
          style={{ minHeight: '42px', fontSize: '0.9rem' }}
          onClick={() => window.dispatchEvent(new CustomEvent('open-transaction-modal'))}
        >
          + Nova Transação
        </button>
      </div>
    </header>
  );
}
