import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './auth.css';
import Logo from '../components/Logo';

export default function Cadastro() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getErrorMessage = (errorMsg) => {
    if (errorMsg.includes('User already registered') || errorMsg.includes('already exists')) {
      return 'Este e-mail já está cadastrado em nossa plataforma.';
    }
    if (errorMsg.includes('Password should be at least')) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (errorMsg.includes('Email rate limit exceeded') || errorMsg.includes('Too many requests')) {
      return 'Muitas tentativas de cadastro. Tente novamente mais tarde.';
    }
    return `Erro ao cadastrar: ${errorMsg}`;
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'O nome é obrigatório.';
    }

    if (!email) {
      newErrors.email = 'O e-mail é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de e-mail inválido.';
    }
    
    if (!password) {
      newErrors.password = 'A senha é obrigatória.';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrors({ submit: getErrorMessage(error.message) });
        setIsLoading(false);
        return;
      }

      // If successful, insert into custom user table
      if (data?.user) {
        const { error: insertError } = await supabase.from("usuarios").insert({
          id: data.user.id,
          nome: name,
          email: email
        });

        if (insertError) {
          setErrors({ submit: 'Erro ao salvar perfil: ' + insertError.message });
          setIsLoading(false);
          return;
        }

        // Redirect to onboarding on success
        navigate('/onboarding');
      }
      
      setIsLoading(false);
<<<<<<< HEAD
>>>>>>> Stashed changes
=======
>>>>>>> d73678555a480bdb850a45d6acb09df2628da2e8
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <Logo />
        </Link>
        
        <div className="auth-header">
          <h2>Crie sua conta</h2>
          <p>Dê o primeiro passo para organizar sua vida financeira.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Nome completo</label>
            <div className="input-wrapper">
              <input
                id="name"
                type="text"
                className={`auth-input ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
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

          <button type="submit" className="auth-button" style={{ width: '100%', marginTop: '24px' }} disabled={isLoading}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="auth-footer">
          Já tem uma conta?
          <Link to="/login" className="auth-link">Entrar agora</Link>
        </div>
      </div>
    </div>
  );
}
