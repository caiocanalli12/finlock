import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import './auth.css';
import logobranca from '../assets/logobranca.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const getErrorMessage = (errorMsg) => {
    if (errorMsg.includes('Invalid login credentials') || errorMsg.includes('Invalid email or password')) {
      return 'E-mail ou senha incorretos.';
    }
    if (errorMsg.includes('Email not confirmed')) {
      return 'Por favor, confirme seu e-mail antes de entrar.';
    }
    return `Erro ao entrar: ${errorMsg}`;
  };

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'O e-mail é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de e-mail inválido.';
    }
    
    if (!password) {
      newErrors.password = 'A senha é obrigatória.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      // Simulate API call
      if (email === 'demo@finlock.com' && password === '123456') {
        navigate('/dashboard');
        return;
      }
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrors({ submit: getErrorMessage(error.message) });
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        navigate('/dashboard');
      }
      
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <img src={logobranca} alt="FinLock Logo" />
        </Link>
        
        <div className="auth-header">
          <h2>Bem-vindo de volta</h2>
          <p>Acesse sua conta para visualizar seu painel.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                className={`auth-input ${errors.email ? 'is-invalid' : ''}`}
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label htmlFor="password">Senha</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`auth-input ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {errors.submit && <div className="error-message" style={{ marginTop: '16px', textAlign: 'center' }}>{errors.submit}</div>}

          <button type="submit" className="auth-button" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          Ainda não tem conta?
          <Link to="/cadastro" className="auth-link">Crie uma agora</Link>
        </div>
      </div>

      {/* Floating Theme Toggle */}
      <button 
        className="theme-toggle" 
        onClick={toggleTheme} 
        title={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
        style={{ 
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', 
          border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)', 
          borderRadius: '50%',
          width: '52px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-main)',
          backdropFilter: 'blur(10px)',
          boxShadow: theme === 'dark' ? '0 4px 15px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,0,0,0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = theme === 'dark' ? '0 8px 25px rgba(0,0,0,0.5)' : '0 8px 25px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme === 'dark' ? '0 4px 15px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,0,0,0.05)';
        }}
      >
        {theme === 'light' ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        )}
      </button>
    </div>
  );
}
