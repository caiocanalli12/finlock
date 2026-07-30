import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Transaction } from '../../types';
import { PieChart, BarChart3, AlignLeft, LineChart } from 'lucide-react';

interface DashboardChartProps {
  transactions: Transaction[];
}

type ChartType = 'pie' | 'column' | 'bar' | 'line';
type CategoryData = { label: string, value: number, color: string, emoji: string, type: 'income' | 'expense' };

export default function DashboardChart({ transactions }: DashboardChartProps) {
  const { theme } = useTheme();
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [hoveredSlice, setHoveredSlice] = useState<'income' | 'expense' | null>(null);
  const [hoveredItem, setHoveredItem] = useState<CategoryData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
  const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  // Mapa de categorias
  const categoryConfig: Record<string, { color: string, emoji: string }> = {
    'Salário': { color: '#15803d', emoji: '💼' },
    'Investimentos': { color: '#4ade80', emoji: '📈' },
    'Receita': { color: '#22c55e', emoji: '💰' },
    'Aluguel': { color: '#be123c', emoji: '🏠' },
    'Moradia': { color: '#9f1239', emoji: '🏠' },
    'Alimentação': { color: '#ea580c', emoji: '🍽️' },
    'Mercado': { color: '#ea580c', emoji: '🛒' },
    'Transporte': { color: '#eab308', emoji: '🚗' },
    'Lazer': { color: '#fca5a5', emoji: '🎉' },
    'Internet': { color: '#3b82f6', emoji: '🌐' },
    'Contas': { color: '#6366f1', emoji: '📄' },
    'Outros': { color: '#a8a29e', emoji: '📦' }
  };

  const fallbackColors = ['#c084fc', '#f472b6', '#38bdf8', '#fbbf24', '#f87171', '#34d399'];

  const incomeGroups: Record<string, number> = {};
  const expenseGroups: Record<string, number> = {};

  transactions.forEach(t => {
    if (t.type === 'income') {
      incomeGroups[t.category] = (incomeGroups[t.category] || 0) + t.amount;
    } else {
      expenseGroups[t.category] = (expenseGroups[t.category] || 0) + t.amount;
    }
  });

  let colorIndex = 0;
  const getCategoryConfig = (catName: string) => {
    if (categoryConfig[catName]) return categoryConfig[catName];
    const color = fallbackColors[colorIndex % fallbackColors.length];
    colorIndex++;
    return { color, emoji: '📌' };
  };

  const incomeData: CategoryData[] = Object.entries(incomeGroups).map(([label, value]) => ({
    label, value, type: 'income', ...getCategoryConfig(label)
  })).sort((a, b) => b.value - a.value);

  const expenseData: CategoryData[] = Object.entries(expenseGroups).map(([label, value]) => ({
    label, value, type: 'expense', ...getCategoryConfig(label)
  })).sort((a, b) => b.value - a.value);

  const totalIncome = incomeData.reduce((acc, curr) => acc + curr.value, 0);
  const totalExpense = expenseData.reduce((acc, curr) => acc + curr.value, 0);
  const total = totalIncome + totalExpense || 1; 
  
  const allData = [...incomeData, ...expenseData];
  const maxValue = Math.max(...allData.map(d => d.value), 1);

  const incomePercent = totalIncome / total;
  const expensePercent = totalExpense / total;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const incomeDash = incomePercent * circumference;
  const expenseDash = expensePercent * circumference;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div style={{
      width: '100%', marginBottom: '32px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '2.5rem 2rem',
      background: theme === 'dark' ? '#003636' : 'var(--bg-main)',
      borderRadius: '24px',
      border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
      boxShadow: theme === 'dark' ? '0 20px 50px rgba(0,0,0,0.4)' : '0 20px 50px rgba(0,0,0,0.06)',
      transition: 'all 0.3s ease'
    }}>
      {/* Cabeçalho e Seletor */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.4rem', fontFamily: 'Outfit, sans-serif' }}>Análise de Categorias</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--evergreen)', background: 'rgba(56, 175, 120, 0.1)', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'capitalize' }}>
            {capitalizedMonth}
          </span>
        </div>

        {/* Switcher de Gráficos */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '4px', borderRadius: '12px' }}>
          {[
            { id: 'pie', icon: <PieChart size={18} strokeWidth={2.5} />, label: 'Setor' },
            { id: 'column', icon: <BarChart3 size={18} strokeWidth={2.5} />, label: 'Colunas' },
            { id: 'bar', icon: <AlignLeft size={18} strokeWidth={2.5} />, label: 'Barras' },
            { id: 'line', icon: <LineChart size={18} strokeWidth={2.5} />, label: 'Linha' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => {
                setChartType(btn.id as ChartType);
                setHoveredItem(null);
                setHoveredSlice(null);
              }}
              title={btn.label}
              style={{
                background: chartType === btn.id ? 'var(--bg-main)' : 'transparent',
                color: chartType === btn.id ? 'var(--primary)' : 'var(--text-muted)',
                border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: chartType === btn.id ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Área do Gráfico */}
      <div 
        style={{ 
          position: 'relative', width: '100%', 
          maxWidth: chartType === 'pie' ? '360px' : '100%', 
          height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center',
          background: chartType === 'pie' ? 'transparent' : (theme === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.02)'),
          borderRadius: '24px',
          padding: chartType === 'pie' ? '0' : '32px',
          border: chartType === 'pie' ? 'none' : '1px solid var(--border)',
          boxShadow: chartType === 'pie' ? 'none' : 'inset 0 4px 20px rgba(0,0,0,0.02)'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHoveredSlice(null); setHoveredItem(null); }}
      >
        {allData.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Nenhum dado registrado neste mês.</div>
        ) : (
          <>
            {/* Grid Background for non-pie charts */}
            {chartType !== 'pie' && (
              <div style={{ position: 'absolute', top: 32, bottom: 32, left: 32, right: 32, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{ width: '100%', height: '1px', background: 'var(--border)', opacity: 0.6 }} />
                ))}
              </div>
            )}
            {chartType === 'pie' && (
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)', overflow: 'visible', pointerEvents: 'none' }}>
                <circle cx="100" cy="100" r={radius} fill="transparent" stroke="var(--border)" strokeWidth="24" opacity="0.3" />
                
                {/* Receitas */}
                {hoveredSlice === 'income' ? (
                  incomeData.map((cat, i) => {
                    const prevTotal = incomeData.slice(0, i).reduce((sum, c) => sum + c.value, 0);
                    const offset = -(prevTotal / total) * circumference;
                    const dash = (cat.value / total) * circumference;
                    return (
                      <circle 
                        key={cat.label} cx="100" cy="100" r={radius}
                        fill="transparent" stroke={cat.color} strokeWidth="28"
                        strokeDasharray={`${dash} ${circumference}`} strokeDashoffset={offset}
                        style={{ transition: 'all 0.3s ease', cursor: 'pointer', pointerEvents: 'stroke' }}
                        onMouseEnter={() => { setHoveredSlice('income'); setHoveredItem(cat); }}
                      />
                    );
                  })
                ) : (
                  <circle 
                    cx="100" cy="100" r={radius}
                    fill="transparent" stroke="#498a6c" strokeWidth="24"
                    strokeDasharray={`${incomeDash} ${circumference}`} strokeDashoffset="0"
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer', opacity: hoveredSlice === 'expense' ? 0.2 : 1, pointerEvents: 'stroke' }}
                    onMouseEnter={() => setHoveredSlice('income')}
                  />
                )}
                
                {/* Despesas */}
                {hoveredSlice === 'expense' ? (
                  expenseData.map((cat, i) => {
                    const prevTotal = expenseData.slice(0, i).reduce((sum, c) => sum + c.value, 0);
                    const offset = -incomeDash - ((prevTotal / total) * circumference);
                    const dash = (cat.value / total) * circumference;
                    return (
                      <circle 
                        key={cat.label} cx="100" cy="100" r={radius}
                        fill="transparent" stroke={cat.color} strokeWidth="28"
                        strokeDasharray={`${dash} ${circumference}`} strokeDashoffset={offset}
                        style={{ transition: 'all 0.3s ease', cursor: 'pointer', pointerEvents: 'stroke' }}
                        onMouseEnter={() => { setHoveredSlice('expense'); setHoveredItem(cat); }}
                      />
                    );
                  })
                ) : (
                  <circle 
                    cx="100" cy="100" r={radius}
                    fill="transparent" stroke="#f43f5e" strokeWidth="24"
                    strokeDasharray={`${expenseDash} ${circumference}`} strokeDashoffset={-incomeDash}
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer', opacity: hoveredSlice === 'income' ? 0.2 : 1, pointerEvents: 'stroke' }}
                    onMouseEnter={() => setHoveredSlice('expense')}
                  />
                )}
              </svg>
            )}

            {chartType === 'column' && (
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-evenly', width: '100%', height: '100%', gap: '16px', position: 'relative', zIndex: 1 }}>
                {allData.map(cat => (
                  <div key={cat.label} 
                      onMouseEnter={() => { setHoveredSlice(cat.type); setHoveredItem(cat); }}
                      style={{
                        flex: 1, maxWidth: '64px', height: `${Math.max((cat.value / maxValue) * 100, 5)}%`,
                        background: `linear-gradient(to top, ${cat.color}88, ${cat.color})`, 
                        borderRadius: '12px 12px 0 0', cursor: 'pointer',
                        boxShadow: `0 8px 24px ${cat.color}40`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', opacity: hoveredSlice && hoveredSlice !== cat.type ? 0.2 : 1
                      }}
                  />
                ))}
              </div>
            )}

            {chartType === 'bar' && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', width: '100%', height: '100%', gap: '16px', paddingRight: '20px', position: 'relative', zIndex: 1 }}>
                {allData.map(cat => (
                  <div key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '36px' }}>
                    <span style={{ width: '120px', textAlign: 'right', fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                      {cat.label}
                    </span>
                    <div style={{ flex: 1, height: '100%', background: 'rgba(0,0,0,0.05)', borderRadius: '0 12px 12px 0', border: '1px solid var(--border)' }}>
                      <div 
                          onMouseEnter={() => { setHoveredSlice(cat.type); setHoveredItem(cat); }}
                          style={{
                            height: '100%', width: `${Math.max((cat.value / maxValue) * 100, 2)}%`,
                            background: `linear-gradient(to right, ${cat.color}88, ${cat.color})`, 
                            borderRadius: '0 10px 10px 0', cursor: 'pointer',
                            boxShadow: `0 4px 16px ${cat.color}30`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', opacity: hoveredSlice && hoveredSlice !== cat.type ? 0.2 : 1
                          }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {chartType === 'line' && (
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}>
                {allData.length > 1 && (
                  <>
                    <polygon 
                      points={`0,100 ${allData.map((cat, i) => `${(i / (allData.length - 1)) * 100},${100 - (cat.value / maxValue) * 95}`).join(' ')} 100,100`}
                      fill="url(#lineGradient)" opacity="0.6"
                    />
                    <polyline 
                      points={allData.map((cat, i) => `${(i / (allData.length - 1)) * 100},${100 - (cat.value / maxValue) * 95}`).join(' ')}
                      fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </>
                )}
                {allData.map((cat, i) => {
                  const cx = allData.length > 1 ? (i / (allData.length - 1)) * 100 : 50;
                  const cy = 100 - (cat.value / maxValue) * 95;
                  return (
                    <circle
                      key={cat.label} cx={cx} cy={cy} r="8"
                      fill={cat.color} stroke="var(--bg-main)" strokeWidth="3"
                      vectorEffect="non-scaling-stroke"
                      onMouseEnter={() => { setHoveredSlice(cat.type); setHoveredItem(cat); }}
                      style={{ cursor: 'pointer', transition: 'all 0.2s', opacity: hoveredSlice && hoveredSlice !== cat.type ? 0.2 : 1, filter: `drop-shadow(0 4px 8px ${cat.color}60)` }}
                    />
                  );
                })}
              </svg>
            )}

            {/* Texto Central (Apenas no Pie Chart) */}
            {chartType === 'pie' && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                textAlign: 'center', pointerEvents: 'none', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', width: '150px', height: '150px'
              }}>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Saldo Mensal</span>
                <strong style={{ fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
                  {formatCurrency(totalIncome - totalExpense)}
                </strong>
              </div>
            )}
          </>
        )}

        {/* Tooltip Dinâmico */}
        {(hoveredSlice || hoveredItem) && (
          <div style={{
            position: 'absolute', top: mousePos.y, left: mousePos.x, transform: 'translate(15px, 15px)',
            background: 'var(--bg-main)', padding: '16px 20px', borderRadius: '16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', zIndex: 50,
            pointerEvents: 'none', whiteSpace: 'nowrap', animation: 'fadeIn 0.15s ease forwards'
          }}>
            {hoveredItem ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {hoveredItem.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4rem', filter: 'grayscale(100%)' }}>{hoveredItem.emoji}</span>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 'bold' }}>{hoveredItem.label}</span>
                </div>
                <span style={{ fontSize: '1.15rem', color: hoveredItem.color, fontWeight: 'bold', marginTop: '4px' }}>
                  {formatCurrency(hoveredItem.value)}
                </span>
              </div>
            ) : (
              // Tooltip de Totais (usado quando paira no anel principal do Pie Chart)
              <>
                <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block' }}>
                    {hoveredSlice === 'income' ? 'Receitas Totais' : 'Despesas Totais'}
                  </span>
                  <span style={{ fontSize: '1.3rem', color: hoveredSlice === 'income' ? '#498a6c' : '#be123c', fontWeight: 'bold' }}>
                    {formatCurrency(hoveredSlice === 'income' ? totalIncome : totalExpense)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(hoveredSlice === 'income' ? incomeData : expenseData).map(cat => (
                    <div key={cat.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        <span style={{ filter: 'grayscale(100%)', opacity: 0.8, marginRight: '8px' }}>{cat.emoji}</span>
                        {cat.label}
                      </span>
                      <span style={{ fontSize: '1.05rem', color: cat.color, fontWeight: 'bold' }}>{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                  {((hoveredSlice === 'income' && incomeData.length === 0) || (hoveredSlice === 'expense' && expenseData.length === 0)) && (
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Nenhum dado</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Legenda Horizontal */}
      {allData.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', width: '100%', marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onMouseEnter={() => setHoveredSlice('income')} onMouseLeave={() => setHoveredSlice(null)}>
            <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#498a6c' }} />
            <span style={{ fontSize: '1.15rem', color: hoveredSlice === 'expense' ? 'var(--text-muted)' : 'var(--text-main)', transition: 'color 0.3s', fontWeight: '600' }}>Receitas</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onMouseEnter={() => setHoveredSlice('expense')} onMouseLeave={() => setHoveredSlice(null)}>
            <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#be123c' }} />
            <span style={{ fontSize: '1.15rem', color: hoveredSlice === 'income' ? 'var(--text-muted)' : 'var(--text-main)', transition: 'color 0.3s', fontWeight: '600' }}>Despesas</span>
          </div>
        </div>
      )}
    </div>
  );
}
