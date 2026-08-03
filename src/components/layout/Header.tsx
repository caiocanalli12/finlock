import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import logobranca from '../../assets/logobranca.png';
import '../../pages/auth.css';

interface HeaderProps {
  toggleSidebar?: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const nextThemeLabel = theme === 'dark' ? 'modo claro' : 'modo escuro';

  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [salaryAmount, setSalaryAmount] = useState<number>(3000);
  const [autoSalaryEnabled, setAutoSalaryEnabled] = useState(false);
  const [autoSalaryDay, setAutoSalaryDay] = useState<number>(5);
  
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [tempSalaryInput, setTempSalaryInput] = useState('');
  const [tempAutoEnabled, setTempAutoEnabled] = useState(false);
  const [tempAutoDay, setTempAutoDay] = useState('5');
  
  const [userName, setUserName] = useState<string>('Utilizador');
  const [userId, setUserId] = useState<string | null>(null);

  // Buscar dados do usuário logado no Supabase
  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data, error } = await supabase
          .from('usuarios')
          .select('nome, salary_amount, auto_salary_enabled, auto_salary_day')
          .eq('id', user.id)
          .single();
          
        if (data) {
          if (data.nome) {
            const firstName = data.nome.split(' ')[0];
            setUserName(firstName);
          }
          if (data.salary_amount) setSalaryAmount(Number(data.salary_amount));
          if (data.auto_salary_enabled !== null) setAutoSalaryEnabled(data.auto_salary_enabled);
          if (data.auto_salary_day) setAutoSalaryDay(data.auto_salary_day);
        } else if (error) {
          console.error("Erro ao buscar dados do usuário:", error.message);
        }
      }
    }
    fetchUserData();
  }, []);



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

  const handleSaveEditedSalary = async () => {
    const parsedAmount = parseFloat(tempSalaryInput);
    const parsedDay = parseInt(tempAutoDay, 10);
    
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      setSalaryAmount(parsedAmount);
      setAutoSalaryEnabled(tempAutoEnabled);
      
      let finalDay = 5;
      if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
        finalDay = parsedDay;
        setAutoSalaryDay(parsedDay);
      }
      
      if (userId) {
        await supabase.from('usuarios').update({
          salary_amount: parsedAmount,
          auto_salary_enabled: tempAutoEnabled,
          auto_salary_day: finalDay
        }).eq('id', userId);
      }
    }
    setIsEditingSalary(false);
  };

  return (
    <header className="dashboard-header">
      <div className="header-left" style={{ width: '50px', display: 'flex', alignItems: 'center' }}>
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            title="Menu"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              padding: '8px',
              marginLeft: '-8px' // offset padding to align perfectly left
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      
      <div className="header-greeting" style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '1.5rem',
        fontWeight: '800',
        fontFamily: 'Outfit, sans-serif',
        background: 'linear-gradient(135deg, var(--pearl-aqua), #7bc4ae)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: theme === 'dark' ? '0 4px 20px rgba(123, 196, 174, 0.2)' : '0 4px 20px rgba(123, 196, 174, 0.1)'
      }}>
        Olá, {userName}
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
          <div className="auth-card" style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsSalaryModalOpen(false)} 
              style={{ 
                position: 'absolute', top: '24px', right: '24px', 
                background: 'transparent', border: 'none', color: 'var(--text-muted)', 
                fontSize: '1.8rem', cursor: 'pointer', lineHeight: 1 
              }}
            >
              &times;
            </button>

            <div className="auth-logo" style={{ pointerEvents: 'none' }}>
              <img src={logobranca} alt="FinLock Logo" />
            </div>

            <div className="auth-header">
              <h2 style={{ fontSize: '1.8rem' }}>Lançar Salário</h2>
              <p>Gerencie o seu salário mensal</p>
            </div>

            {!isEditingSalary ? (
              <div>
                <p style={{ color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: '1.5', marginBottom: '24px', textAlign: 'center' }}>
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
                      setTempAutoEnabled(autoSalaryEnabled);
                      setTempAutoDay(autoSalaryDay.toString());
                      setIsEditingSalary(true);
                    }}
                  >
                    Editar Valor e Automação
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
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Valor do Salário (R$)
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

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span>Ativar Lançamento Automático</span>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox"
                        checked={tempAutoEnabled}
                        onChange={(e) => setTempAutoEnabled(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </label>
                </div>

                {tempAutoEnabled && (
                  <div className="form-group" style={{ marginBottom: '20px', animation: 'fadeIn 0.3s' }}>
                    <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>
                      Dia do Pagamento (1 a 31)
                    </label>
                    <input 
                      className="auth-input" 
                      type="number" 
                      min="1"
                      max="31"
                      value={tempAutoDay} 
                      onChange={e => setTempAutoDay(e.target.value)} 
                      required={tempAutoEnabled}
                    />
                  </div>
                )}

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
