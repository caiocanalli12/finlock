import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './auth.css';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
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
          <Logo />
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
    </div>
  );
}
