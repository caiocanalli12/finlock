import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  toggleSidebar?: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const nextThemeLabel = theme === 'dark' ? 'modo claro' : 'modo escuro';

  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [salaryAmount, setSalaryAmount] = useState<number>(3000);
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [tempSalaryInput, setTempSalaryInput] = useState('');

  // Carregar salário do localStorage
  useEffect(() => {
    const savedSalary = localStorage.getItem('finlock_user_salary');
    if (savedSalary) {
      const parsed = parseFloat(savedSalary);
      if (!isNaN(parsed) && parsed > 0) {
        setSalaryAmount(parsed);
      }
    }
  }, [isSalaryModalOpen]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleLaunchSalary = () => {
    const newTransaction = {
      id: crypto.randomUUID(),
      title: 'Salário',
      amount: salaryAmount,
      type: 'income' as const,
      category: 'Salário',
      date: new Date().toISOString()
    };

    window.dispatchEvent(new CustomEvent('add-direct-transaction', { detail: newTransaction }));
    setIsSalaryModalOpen(false);
    setIsEditingSalary(false);
  };

  const handleSaveEditedSalary = () => {
    const parsed = parseFloat(tempSalaryInput);
    if (!isNaN(parsed) && parsed > 0) {
      setSalaryAmount(parsed);
      localStorage.setItem('finlock_user_salary', parsed.toString());
    }
    setIsEditingSalary(false);
  };

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

        {/* Botão Secundário de Salário */}
        <button 
          className="button"
          style={{
            minHeight: '42px',
            fontSize: '0.9rem',
            backgroundColor: 'transparent',
            border: `1.5px solid ${theme === 'dark' ? 'var(--pearl-aqua)' : 'var(--evergreen)'}`,
            color: theme === 'dark' ? 'var(--pearl-aqua)' : 'var(--evergreen)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => {
            setIsEditingSalary(false);
            setIsSalaryModalOpen(true);
          }}
        >
          Salário
        </button>

        {/* Botão Principal de Nova Transação */}
        <button 
          className="button button--primary" 
          style={{ minHeight: '42px', fontSize: '0.9rem' }}
          onClick={() => window.dispatchEvent(new CustomEvent('open-transaction-modal'))}
        >
          + Nova Transação
        </button>
      </div>

      {/* Modal de Confirmação / Edição do Salário usando Portal */}
      {isSalaryModalOpen && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '32px',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '420px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>
                Lançar Salário
              </h3>
              <button 
                onClick={() => setIsSalaryModalOpen(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {!isEditingSalary ? (
              <div>
                <p style={{ color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: '1.5', marginBottom: '24px' }}>
                  Deseja lançar o seu salário de <strong style={{ color: theme === 'dark' ? 'var(--pearl-aqua)' : 'var(--evergreen)' }}>{formatCurrency(salaryAmount)}</strong> nas receitas deste mês?
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button 
                    type="button" 
                    className="button"
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem'
                    }}
                    onClick={() => {
                      setTempSalaryInput(salaryAmount.toString());
                      setIsEditingSalary(true);
                    }}
                  >
                    Editar Valor
                  </button>
                  <button 
                    type="button" 
                    className="button button--primary"
                    style={{ fontSize: '0.95rem' }}
                    onClick={handleLaunchSalary}
                  >
                    Lançar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Novo Valor do Salário (R$)
                  </label>
                  <input 
                    className="auth-input" 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    value={tempSalaryInput} 
                    onChange={e => setTempSalaryInput(e.target.value)} 
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button 
                    type="button" 
                    className="button"
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem'
                    }}
                    onClick={() => setIsEditingSalary(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="button button--primary"
                    style={{ fontSize: '0.95rem' }}
                    onClick={handleSaveEditedSalary}
                  >
                    Salvar Novo Valor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
