import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import './auth.css';

export default function Onboarding() {
  const [balance, setBalance] = useState('');
  const [salary, setSalary] = useState('');
  const [goal, setGoal] = useState('Controlar gastos');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guardar dados no localStorage para persistência e simular o fluxo
    localStorage.setItem('finlock_initial_balance', balance || '0');
    localStorage.setItem('finlock_user_salary', salary || '3000');
    localStorage.setItem('finlock_user_goal', goal);

    navigate('/dashboard');
  };

  return (
    <div className="auth-container" style={{ minHeight: '100vh', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card" style={{ maxWidth: '460px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <Logo />
        </div>

        <div className="auth-header" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'Outfit, sans-serif' }}>Bem-vindo ao FinLock</h2>
          <p>Vamos personalizar a sua experiência financeira em poucos passos.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem' }}>
              Qual é o seu Saldo Atual? (R$)
            </label>
            <input 
              className="auth-input" 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              value={balance} 
              onChange={e => setBalance(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem' }}>
              Qual é o seu Salário Fixo? (R$)
            </label>
            <input 
              className="auth-input" 
              type="number" 
              step="0.01" 
              placeholder="Ex: 3500.00" 
              value={salary} 
              onChange={e => setSalary(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem' }}>
              Qual o seu principal objetivo?
            </label>
            <select 
              className="auth-input" 
              value={goal} 
              onChange={e => setGoal(e.target.value)}
              style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', cursor: 'pointer' }}
            >
              <option value="Controlar gastos">Controlar gastos</option>
              <option value="Sair das dívidas">Sair das dívidas</option>
              <option value="Poupar/Investir">Poupar/Investir</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="button button--primary" 
            style={{ marginTop: '12px', minHeight: '48px', fontSize: '1rem', width: '100%' }}
          >
            Começar a usar o FinLock
          </button>
        </form>
      </div>
    </div>
  );
}
