import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import LogoImage from '../components/Logo';
import { Link } from 'react-router-dom';
import logobranca from '../assets/logobranca.png';

function Logo({ large = false }) {
  return (
    <Link className="logo" to="/" aria-label="Voltar ao início do FinLock" style={{ display: 'inline-block' }}>
      <LogoImage style={{ height: large ? '84px' : '48px', width: 'auto' }} />
    </Link>
  );
}

function InteractiveChart() {
  const { theme } = useTheme();
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Pega o mês atual dinamicamente em Português
  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
  const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  // Dados simulados com subcategorias
  const incomeData = [
    { label: 'Salário', value: 7000, color: '#15803d', emoji: '💼' },
    { label: 'Investimentos', value: 1500, color: '#4ade80', emoji: '📈' }
  ];

  const expenseData = [
    { label: 'Aluguel', value: 1500, color: '#be123c', emoji: '🏠' },     // Vermelho/Rose Escuro
    { label: 'Alimentação', value: 900, color: '#ea580c', emoji: '🍽️' },  // Laranja Vibrante
    { label: 'Transporte', value: 400, color: '#eab308', emoji: '🚗' },   // Amarelo Ouro
    { label: 'Lazer', value: 400, color: '#fca5a5', emoji: '🎉' }        // Rosa Claro
  ];

  const totalIncome = incomeData.reduce((acc, curr) => acc + curr.value, 0);
  const totalExpense = expenseData.reduce((acc, curr) => acc + curr.value, 0);
  const total = totalIncome + totalExpense;
  
  const incomePercent = totalIncome / total;
  const expensePercent = totalExpense / total;

  // Cálculos do SVG da rosquinha
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  
  const incomeDash = incomePercent * circumference;
  const expenseDash = expensePercent * circumference;

  return (
    <div style={{
      width: '100%',
      maxWidth: '420px',
      aspectRatio: '1 / 1',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: theme === 'dark' ? '#003636' : 'var(--bg-main)',
      padding: '2rem',
      borderRadius: '24px',
      border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
      boxShadow: theme === 'dark' ? '0 20px 50px rgba(0,0,0,0.5)' : '0 20px 50px rgba(0,0,0,0.06)'
    }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Visão Mensal</h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--evergreen)', background: 'rgba(56, 175, 120, 0.1)', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'capitalize' }}>
          {capitalizedMonth}
        </span>
      </div>

      <div 
        style={{ position: 'relative', width: '320px', height: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
        }}
        onMouseLeave={() => setHoveredSlice(null)}
      >
        <svg width="320" height="320" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)', overflow: 'visible', pointerEvents: 'none' }}>
          {/* Fundo da rosquinha (opcional, para dar um guia visual) */}
          <circle cx="100" cy="100" r={radius} fill="transparent" stroke="var(--border)" strokeWidth="24" opacity="0.2" />
          
          {/* Fatias de Receita */}
          {hoveredSlice === 'income' ? (
            incomeData.map((cat, i) => {
              const prevTotal = incomeData.slice(0, i).reduce((sum, c) => sum + c.value, 0);
              const offset = -(prevTotal / total) * circumference;
              const dash = (cat.value / total) * circumference;
              return (
                <circle 
                  key={cat.label}
                  cx="100" cy="100" r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth="28"
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeDashoffset={offset}
                  style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', pointerEvents: 'stroke' }}
                  onMouseEnter={() => setHoveredSlice('income')}
                />
              );
            })
          ) : (
            <circle 
              cx="100" cy="100" r={radius}
              fill="transparent"
              stroke="#498a6c"
              strokeWidth="24"
              strokeDasharray={`${incomeDash} ${circumference}`}
              strokeDashoffset="0"
              style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', opacity: hoveredSlice === 'expense' ? 0.3 : 1, pointerEvents: 'stroke' }}
              onMouseEnter={() => setHoveredSlice('income')}
            />
          )}
          
          {/* Fatias de Despesa */}
          {hoveredSlice === 'expense' ? (
            expenseData.map((cat, i) => {
              const prevTotal = expenseData.slice(0, i).reduce((sum, c) => sum + c.value, 0);
              const offset = -incomeDash - ((prevTotal / total) * circumference);
              const dash = (cat.value / total) * circumference;
              return (
                <circle 
                  key={cat.label}
                  cx="100" cy="100" r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth="28"
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeDashoffset={offset}
                  style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', pointerEvents: 'stroke' }}
                  onMouseEnter={() => setHoveredSlice('expense')}
                />
              );
            })
          ) : (
            <circle 
              cx="100" cy="100" r={radius}
              fill="transparent"
              stroke="#f43f5e"
              strokeWidth="24"
              strokeDasharray={`${expenseDash} ${circumference}`}
              strokeDashoffset={-incomeDash}
              style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', opacity: hoveredSlice === 'income' ? 0.3 : 1, pointerEvents: 'stroke' }}
              onMouseEnter={() => setHoveredSlice('expense')}
            />
          )}
        </svg>

        {/* Texto Central */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '140px',
          height: '140px'
        }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Saldo Restante</span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
            R$ {totalIncome - totalExpense}
          </strong>
        </div>

        {/* Tooltip Dinâmico Seguindo o Mouse */}
        {hoveredSlice && (
          <div style={{
            position: 'absolute',
            top: mousePos.y,
            left: mousePos.x,
            transform: 'translate(20px, 20px)',
            background: 'var(--bg-main)',
            padding: '16px 20px',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 10,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.1s ease forwards'
          }}>
            <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block' }}>
                {hoveredSlice === 'income' ? 'Receita Total' : 'Despesa Total'}
              </span>
              <span style={{ fontSize: '1.25rem', color: hoveredSlice === 'income' ? '#498a6c' : '#be123c', fontWeight: 'bold' }}>
                R$ {hoveredSlice === 'income' ? totalIncome : totalExpense}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(hoveredSlice === 'income' ? incomeData : expenseData).map(cat => (
                <div key={cat.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                    <span style={{ filter: 'grayscale(100%)', opacity: 0.8, marginRight: '8px' }}>{cat.emoji}</span>
                    {cat.label}
                  </span>
                  <span style={{ fontSize: '1rem', color: cat.color, fontWeight: 'bold' }}>R$ {cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legenda Horizontal */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onMouseEnter={() => setHoveredSlice('income')} onMouseLeave={() => setHoveredSlice(null)}>
          <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#498a6c' }} />
          <span style={{ fontSize: '1.1rem', color: hoveredSlice === 'expense' ? 'var(--text-muted)' : 'var(--text-main)', transition: 'color 0.3s', fontWeight: 'bold' }}>Receitas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onMouseEnter={() => setHoveredSlice('expense')} onMouseLeave={() => setHoveredSlice(null)}>
          <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#be123c' }} />
          <span style={{ fontSize: '1.1rem', color: hoveredSlice === 'income' ? 'var(--text-muted)' : 'var(--text-main)', transition: 'color 0.3s', fontWeight: 'bold' }}>Despesas</span>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const { theme } = useTheme();

  return (
    <section className="hero section" id="inicio" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative' }}>
      
      <div className="container" style={{ 
        maxWidth: '1600px',
        display: 'grid', 
        gridTemplateColumns: 'minmax(400px, 1.3fr) minmax(300px, 1fr)', 
        gap: '14rem', 
        alignItems: 'center',
        paddingTop: '2rem',
        paddingBottom: '2rem'
      }}>
        
        {/* Left Column */}
        <div className="hero__content reveal" style={{ alignItems: 'flex-start', textAlign: 'left', margin: 0, transform: 'translateX(-4rem)' }}>
          <p className="eyebrow" style={{ color: theme === 'dark' ? 'var(--pearl-aqua)' : 'var(--evergreen)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.1rem', whiteSpace: 'nowrap', marginBottom: '0.5rem' }}>
            Gestão financeira sem dor de cabeça.
          </p>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', margin: '0 0 1rem', marginLeft: '-0.5rem' }}>
            <img 
              src={logobranca} 
              alt="FinLock Logo" 
              style={{ 
                height: 'clamp(8rem, 15vw, 11rem)', 
                width: 'auto', 
                position: 'absolute', 
                right: '100%', 
                marginRight: '-2rem',
                filter: theme === 'dark'
                  ? 'drop-shadow(0 0 20px rgba(148, 209, 190, 0.5)) drop-shadow(0 0 8px rgba(148, 209, 190, 0.3))'
                  : 'drop-shadow(0 0 20px rgba(33, 90, 68, 0.4)) drop-shadow(0 0 8px rgba(33, 90, 68, 0.2))'
              }} 
            />
            <h1 style={{ 
              fontSize: 'clamp(8rem, 15vw, 11rem)', 
              margin: 0, 
              lineHeight: '1',
              fontWeight: '900',
              color: theme === 'dark' ? 'var(--pearl-aqua)' : 'var(--evergreen)',
              letterSpacing: '-4px',
              textShadow: theme === 'dark' 
                ? '0 0 40px rgba(148, 209, 190, 0.5), 0 0 15px rgba(148, 209, 190, 0.3)'
                : '0 0 40px rgba(33, 90, 68, 0.4), 0 0 15px rgba(33, 90, 68, 0.2)'
            }}>
              FinLock
            </h1>
          </div>

          <p className="hero__lead" style={{ 
            fontSize: '1.35rem', 
            marginBottom: '4rem', 
            color: 'var(--text-muted)', 
            maxWidth: '100%', 
            lineHeight: '1.85',
            textAlign: 'justify',
            fontWeight: '400',
            opacity: 0.9,
            marginLeft: '3rem'
          }}>
            O FinLock é a sua plataforma definitiva para organizar finanças, controlar gastos e planejar o futuro sem depender de planilhas complexas. Tudo o que você precisa de forma clara, direta e visual.
          </p>

          <div className="hero__actions" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '1.5rem', flexWrap: 'nowrap', width: '100%', marginLeft: '3rem' }}>
            <a 
              className="button button--primary button--large" 
              href="/cadastro" 
              style={{ fontSize: '1.2rem', padding: '1.25rem 2.5rem', borderRadius: '16px', background: 'linear-gradient(135deg, var(--pearl-aqua), #7bc4ae)', color: '#022c22', border: '1.5px solid transparent', fontWeight: 'bold', boxShadow: theme === 'dark' ? '0 8px 30px rgba(148, 209, 190, 0.3)' : '0 8px 20px rgba(33, 90, 68, 0.2)', whiteSpace: 'nowrap', textAlign: 'center' }}
            >
              Criar conta gratuita
            </a>
            <a 
              className="button button--ghost button--large" 
              href="/login" 
              style={{ fontSize: '1.2rem', padding: '1.25rem 2.5rem', borderRadius: '16px', border: theme === 'dark' ? '1.5px solid rgba(255, 255, 255, 0.15)' : '1.5px solid rgba(0, 0, 0, 0.15)', color: 'var(--text-main)', background: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', fontWeight: 'bold', whiteSpace: 'nowrap', textAlign: 'center' }}
            >
              Já tenho uma conta
            </a>
          </div>
        </div>

        {/* Right Column */}
        <div className="hero__visual reveal reveal--delay" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', position: 'relative', left: '100px' }}>
          <InteractiveChart />
        </div>
        
      </div>
    </section>
  );
}

function Footer({ theme, onToggleTheme }) {
  const nextThemeLabel = theme === 'dark' ? 'modo claro' : 'modo escuro';
  return (
    <>
      {/* Floating Theme Toggle */}
      <button 
        className="theme-toggle" 
        onClick={onToggleTheme} 
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
    </>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Navbar foi removida conforme solicitado */}
      <main>
        <Hero />
      </main>
      <Footer theme={theme} onToggleTheme={toggleTheme} />
    </>
  );
}
