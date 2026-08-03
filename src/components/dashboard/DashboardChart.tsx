import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Transaction } from '../../types';
import { PieChart, BarChart3, Pencil } from 'lucide-react';

interface DashboardChartProps {
  transactions: Transaction[];
  selectedPeriod?: string;
  availablePeriods?: string[];
  onPeriodChange?: (period: string) => void;
  onCategoryUpdate?: (categoryLabel: string, newValue: number) => void;
}

type ChartType = 'pie' | 'column';
type CategoryData = { label: string, value: number, color: string, emoji: string, type: 'income' | 'expense' };

export default function DashboardChart({ transactions, selectedPeriod, availablePeriods, onPeriodChange, onCategoryUpdate }: DashboardChartProps) {
  const { theme } = useTheme();
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [hoveredSlice, setHoveredSlice] = useState<'income' | 'expense' | null>(null);
  const [hoveredItem, setHoveredItem] = useState<CategoryData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const [lockedTooltip, setLockedTooltip] = useState<{ x: number, y: number, slice: 'income' | 'expense' | null, item: CategoryData | null } | null>(null);

  const handleContentEdit = (e: React.FocusEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>, catLabel: string, originalValue: number) => {
    let text = e.currentTarget.textContent || '';
    text = text.replace(/[^0-9,.]/g, '');
    if (text.includes('.') && text.includes(',')) {
      text = text.replace(/\./g, '').replace(',', '.');
    } else if (text.includes(',')) {
      text = text.replace(',', '.');
    }
    const num = parseFloat(text);
    if (!isNaN(num) && num !== originalValue) {
      if (onCategoryUpdate) onCategoryUpdate(catLabel, num);
    } else {
      // Revert if invalid
      e.currentTarget.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(originalValue);
    }
  };

  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
  const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  // Mapa de categorias
  const categoryConfig: Record<string, { color: string, emoji: string }> = {
    'Salário': { color: '#15803d', emoji: '💵' },
    'Investimentos': { color: '#4ade80', emoji: '📈' },
    'Receita': { color: '#22c55e', emoji: '💰' },
    'Aluguel': { color: '#be123c', emoji: '🏠' },
    'Moradia': { color: '#9f1239', emoji: '🏡' },
    'Alimentação': { color: '#ea580c', emoji: '🍔' },
    'Mercado': { color: '#ea580c', emoji: '🛒' },
    'Transporte': { color: '#eab308', emoji: '🚗' },
    'Lazer': { color: '#fca5a5', emoji: '🎭' },
    'Internet': { color: '#3b82f6', emoji: '🌐' },
    'Contas': { color: '#6366f1', emoji: '🧾' },
    'Outros': { color: '#a8a29e', emoji: '📦' },
    'Pix': { color: '#32bcad', emoji: '⚡' },
    'Outra': { color: '#a8a29e', emoji: '🏷️' }
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
  const incomeFallbackColors = ['#22c55e', '#16a34a', '#15803d', '#4ade80', '#10b981', '#34d399'];
  const expenseFallbackColors = ['#f43f5e', '#e11d48', '#be123c', '#fb7185', '#f87171', '#ef4444'];
  
  const getCategoryConfig = (catName: string, type: 'income' | 'expense') => {
    // Tratamento para strings corrompidas no banco de dados legadas
    const normalizedName = catName.replace('rio', 'ário').replace('ǭ', 'á').replace('Sade', 'Saúde').replace('ao', 'ação').replace('ǜ', 'çã').replace('ǧ', 'ú');
    
    // Busca pelas chaves do categoryConfig ignorando acentos/erros simples
    for (const key in categoryConfig) {
      if (key === catName || key === normalizedName || catName.includes(key.substring(0,3))) {
        return categoryConfig[key];
      }
    }
    
    // Se não encontrar, usar cor baseada no tipo para não descaracterizar o gráfico
    const fallbackList = type === 'income' ? incomeFallbackColors : expenseFallbackColors;
    const color = fallbackList[colorIndex % fallbackList.length];
    colorIndex++;
    return { color, emoji: '📌' };
  };

  const incomeData: CategoryData[] = Object.entries(incomeGroups).map(([label, value]) => ({
    label, value, type: 'income', ...getCategoryConfig(label, 'income')
  })).sort((a, b) => b.value - a.value);

  const expenseData: CategoryData[] = Object.entries(expenseGroups).map(([label, value]) => ({
    label, value, type: 'expense', ...getCategoryConfig(label, 'expense')
  })).sort((a, b) => b.value - a.value);

  const totalIncome = incomeData.reduce((acc, curr) => acc + curr.value, 0);
  const totalExpense = expenseData.reduce((acc, curr) => acc + curr.value, 0);
  const total = totalIncome + totalExpense || 1; 
  
  const allData = [...incomeData, ...expenseData];
  const maxValue = Math.max(...allData.map(d => d.value), 1);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const balanceStr = formatCurrency(totalIncome - totalExpense);
  const radius = balanceStr.length > 18 ? 86 : balanceStr.length > 14 ? 78 : 70;
  const circumference = 2 * Math.PI * radius;

  // Global visual weights to prevent tiny values from disappearing
  const visualIncome = totalIncome > 0 ? Math.max(totalIncome, total * 0.08) : 0;
  const visualExpense = totalExpense > 0 ? Math.max(totalExpense, total * 0.08) : 0;
  const visualTotal = visualIncome + visualExpense || 1;

  const incomeDash = (visualIncome / visualTotal) * circumference;
  const expenseDash = (visualExpense / visualTotal) * circumference;

  const getVisualData = (data: CategoryData[], originalGroupTotal: number, visualGroupTotal: number) => {
    if (data.length === 0) return [];
    // Enforce minimum 8% of the group for each item
    const withVisual = data.map(cat => ({
      ...cat,
      visualValue: Math.max(cat.value, originalGroupTotal * 0.08)
    }));
    const sumVisual = withVisual.reduce((acc, curr) => acc + curr.visualValue, 0);
    // Scale them so they sum exactly to visualGroupTotal (which is their share of the overall pie)
    return withVisual.map(cat => ({
      ...cat,
      visualValue: (cat.visualValue / sumVisual) * visualGroupTotal
    }));
  };

  const visualIncomeData = getVisualData(incomeData, totalIncome, visualIncome);
  const visualExpenseData = getVisualData(expenseData, totalExpense, visualExpense);



  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div style={{
      width: '100%', marginBottom: '32px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '1rem 0'
    }}>
      {/* Cabeçalho e Seletor */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h3 style={{ 
            color: 'var(--text-main)', margin: 0, fontSize: '1.4rem', fontFamily: 'Outfit, sans-serif',
            textDecoration: 'underline', textDecorationColor: 'var(--primary)', textDecorationThickness: '3px', textUnderlineOffset: '8px',
            lineHeight: 1
          }}>
            Análise de Categorias
          </h3>
          {selectedPeriod && availablePeriods && onPeriodChange ? (
            <select 
              value={selectedPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              style={{
                fontSize: '1.05rem', 
                color: theme === 'dark' ? 'var(--pearl-aqua)' : 'var(--evergreen)', 
                background: theme === 'dark' ? 'rgba(148, 209, 190, 0.1)' : 'rgba(56, 175, 120, 0.1)', 
                padding: '6px 16px', 
                borderRadius: '24px', 
                fontWeight: '600', 
                textTransform: 'capitalize',
                border: theme === 'dark' ? '1px solid rgba(148, 209, 190, 0.3)' : '1px solid rgba(56, 175, 120, 0.3)', 
                outline: 'none', 
                cursor: 'pointer', 
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: theme === 'dark' ? '0 4px 12px rgba(148, 209, 190, 0.1)' : '0 4px 12px rgba(56, 175, 120, 0.1)',
                appearance: 'none',
                WebkitAppearance: 'none',
                lineHeight: 1
              }}
            >
              {availablePeriods.map(p => {
                const [y, m] = p.split('-');
                const date = new Date(parseInt(y), parseInt(m) - 1, 1);
                const monthName = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                return <option key={p} value={p} style={{ color: 'var(--onyx)', textTransform: 'capitalize' }}>{monthName}</option>;
              })}
            </select>
          ) : (
            <span style={{ fontSize: '1.05rem', color: theme === 'dark' ? 'var(--pearl-aqua)' : 'var(--evergreen)', background: theme === 'dark' ? 'rgba(148, 209, 190, 0.1)' : 'rgba(56, 175, 120, 0.1)', padding: '6px 16px', borderRadius: '24px', fontWeight: '600', textTransform: 'capitalize', lineHeight: 1 }}>
              {capitalizedMonth}
            </span>
          )}
        </div>

        {/* Switcher de Gráficos */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '4px', 
          background: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.4)', 
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)', 
          padding: '4px', borderRadius: '24px',
          marginTop: '6px'
        }}>
          {[
            { id: 'pie', icon: <PieChart size={18} strokeWidth={2.5} />, label: 'Setor' },
            { id: 'column', icon: <BarChart3 size={18} strokeWidth={2.5} />, label: 'Colunas' }
          ].map(c => (
            <button 
              key={c.id} 
              onClick={() => {
                setChartType(c.id as ChartType);
                setHoveredItem(null);
                setHoveredSlice(null);
              }}
              title={c.label}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: chartType === c.id ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#ffffff') : 'transparent',
                color: chartType === c.id ? 'var(--text-main)' : 'var(--text-muted)',
                border: 'none', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                fontWeight: chartType === c.id ? '600' : '500', transition: 'all 0.2s ease',
                boxShadow: chartType === c.id ? (theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.06)') : 'none'
              }}
            >
              {React.cloneElement(c.icon, { color: chartType === c.id ? (theme === 'dark' ? 'var(--pearl-aqua)' : 'var(--evergreen)') : 'currentColor' })}
              <span style={{ fontSize: '0.9rem' }}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Área do Gráfico */}
      <div 
        style={{ 
          position: 'relative', width: '100%', 
          maxWidth: '750px', 
          height: '400px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '32px',
          background: theme === 'dark' ? '#003636' : 'var(--bg-main)',
          borderRadius: '24px',
          padding: '24px 48px',
          border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: theme === 'dark' ? '0 20px 50px rgba(0,0,0,0.4)' : '0 20px 50px rgba(0,0,0,0.06)'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { 
          if (!lockedTooltip) {
            setHoveredSlice(null); 
            setHoveredItem(null); 
          }
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setLockedTooltip(null);
          }
        }}
      >
        {allData.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', width: '100%', textAlign: 'center' }}>Nenhum dado registrado neste mês.</div>
        ) : (
          <>
            {/* Legenda Vertical Lateral (Esquerda) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '160px', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onMouseEnter={() => setHoveredSlice('income')} onMouseLeave={() => setHoveredSlice(null)}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 16px rgba(74, 222, 128, 0.6)' }} />
                <span style={{ fontSize: '1.3rem', color: hoveredSlice === 'expense' ? 'var(--text-muted)' : 'var(--text-main)', transition: 'color 0.3s', fontWeight: '600' }}>Receitas</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onMouseEnter={() => setHoveredSlice('expense')} onMouseLeave={() => setHoveredSlice(null)}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 16px rgba(244, 63, 94, 0.6)' }} />
                <span style={{ fontSize: '1.3rem', color: hoveredSlice === 'income' ? 'var(--text-muted)' : 'var(--text-main)', transition: 'color 0.3s', fontWeight: '600' }}>Despesas</span>
              </div>
            </div>

            <div style={{ flex: 1, height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {chartType === 'pie' && (
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)', overflow: 'visible', pointerEvents: 'none' }}>
                <circle cx="100" cy="100" r={radius} fill="transparent" stroke="var(--border)" strokeWidth="24" opacity="0.3" />
                
                {/* Entradas */}
                {totalIncome > 0 && (
                  <circle 
                    cx="100" cy="100" r={radius}
                    fill="transparent" stroke="#4ade80" strokeWidth="24"
                    strokeDasharray={`${incomeDash} ${circumference}`} strokeDashoffset="0"
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer', opacity: (lockedTooltip ? lockedTooltip.slice : hoveredSlice) === 'expense' ? 0.2 : 1, pointerEvents: 'stroke' }}
                    onMouseEnter={() => { if (!lockedTooltip) { setHoveredSlice('income'); setHoveredItem(null); } }}
                    onClick={(e) => { e.stopPropagation(); setLockedTooltip({ x: mousePos.x, y: mousePos.y, slice: 'income', item: null }); }}
                  />
                )}
                
                {/* Despesas */}
                {totalExpense > 0 && (
                  <circle 
                    cx="100" cy="100" r={radius}
                    fill="transparent" stroke="#f43f5e" strokeWidth="24"
                    strokeDasharray={`${expenseDash} ${circumference}`} strokeDashoffset={-incomeDash}
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer', opacity: (lockedTooltip ? lockedTooltip.slice : hoveredSlice) === 'income' ? 0.2 : 1, pointerEvents: 'stroke' }}
                    onMouseEnter={() => { if (!lockedTooltip) { setHoveredSlice('expense'); setHoveredItem(null); } }}
                    onClick={(e) => { e.stopPropagation(); setLockedTooltip({ x: mousePos.x, y: mousePos.y, slice: 'expense', item: null }); }}
                  />
                )}
              </svg>
            )}

            {chartType === 'column' && (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '280px', height: '280px', margin: '0 auto', gap: '32px', position: 'relative', zIndex: 1 }} onMouseLeave={() => { setHoveredSlice(null); setHoveredItem(null); }}>
                  
                  {/* Coluna de Receitas */}
                  <div 
                    onMouseEnter={() => { if (!lockedTooltip) { setHoveredSlice('income'); setHoveredItem(null); } }}
                    onClick={(e) => { e.stopPropagation(); setLockedTooltip({ x: mousePos.x, y: mousePos.y, slice: 'income', item: null }); }}
                    style={{ flex: 1, maxWidth: '80px', height: `${(visualIncome / visualTotal) * 100}%`, backgroundColor: '#4ade80', borderRadius: '8px', position: 'relative', cursor: 'pointer', transition: 'transform 0.2s ease', transform: (lockedTooltip ? lockedTooltip.slice : hoveredSlice) === 'income' ? 'scaleX(1.05)' : 'scaleX(1)', opacity: (lockedTooltip ? lockedTooltip.slice : hoveredSlice) === 'expense' ? 0.3 : 1 }}
                  />

                  {/* Coluna de Despesas */}
                  <div 
                    onMouseEnter={() => { if (!lockedTooltip) { setHoveredSlice('expense'); setHoveredItem(null); } }}
                    onClick={(e) => { e.stopPropagation(); setLockedTooltip({ x: mousePos.x, y: mousePos.y, slice: 'expense', item: null }); }}
                    style={{ flex: 1, maxWidth: '80px', height: `${(visualExpense / visualTotal) * 100}%`, backgroundColor: '#f43f5e', borderRadius: '8px', position: 'relative', cursor: 'pointer', transition: 'transform 0.2s ease', transform: (lockedTooltip ? lockedTooltip.slice : hoveredSlice) === 'expense' ? 'scaleX(1.05)' : 'scaleX(1)', opacity: (lockedTooltip ? lockedTooltip.slice : hoveredSlice) === 'income' ? 0.3 : 1 }}
                  />
                  
                </div>
              )}

            {/* Texto Central (Apenas no Pie Chart) */}
            {chartType === 'pie' && (() => {
              const balanceFontSize = balanceStr.length > 18 ? '1.1rem' : balanceStr.length > 14 ? '1.3rem' : balanceStr.length > 10 ? '1.5rem' : '1.8rem';
              const balanceValue = totalIncome - totalExpense;
              const positiveColor = '#4ade80';
              const negativeColor = '#e74c3c';
              const balanceColor = balanceValue > 0 ? positiveColor : balanceValue < 0 ? negativeColor : 'var(--text-main)';

              return (
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  textAlign: 'center', pointerEvents: 'none', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', width: '200px', height: '200px'
                }}>
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Saldo Mensal</span>
                  <strong style={{ fontSize: balanceFontSize, color: balanceColor, fontWeight: 'bold', whiteSpace: 'nowrap', lineHeight: 1.1 }}>
                    {balanceStr}
                  </strong>
                </div>
              );
            })()}
            </div>
          </>
        )}

        {/* Tooltip Dinâmico */}
        {(lockedTooltip || hoveredSlice || hoveredItem) && (
          <div style={{
            position: 'absolute', top: lockedTooltip ? lockedTooltip.y : mousePos.y, left: lockedTooltip ? lockedTooltip.x : mousePos.x, transform: 'translate(15px, 15px)',
            background: 'var(--bg-main)', padding: '16px 20px', borderRadius: '16px',
            border: lockedTooltip ? '2px solid var(--primary)' : '1px solid var(--border)', 
            boxShadow: 'var(--shadow-lg)', zIndex: 50,
            pointerEvents: lockedTooltip ? 'auto' : 'none', 
            whiteSpace: 'nowrap', animation: 'fadeIn 0.15s ease forwards',
            minWidth: '220px'
          }}>
            {lockedTooltip && (
              <div style={{ position: 'absolute', top: '-12px', right: '-12px', background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} onClick={() => { setLockedTooltip(null); }}>✕</div>
            )}
            
            {(lockedTooltip ? lockedTooltip.item : hoveredItem) ? (() => {
              const item = (lockedTooltip ? lockedTooltip.item : hoveredItem)!;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {item.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.4rem', filter: 'grayscale(100%)' }}>{item.emoji}</span>
                    <span style={{ fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 'bold' }}>{item.label}</span>
                  </div>
                  
                  <span 
                    contentEditable={!!lockedTooltip}
                    suppressContentEditableWarning
                    onBlur={(e) => handleContentEdit(e, item.label, item.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                    style={{ 
                      fontSize: '1.15rem', color: item.color, fontWeight: 'bold', marginTop: '4px', 
                      cursor: lockedTooltip ? 'text' : 'default', 
                      outline: 'none',
                      borderBottom: lockedTooltip ? `1px dashed ${item.color}80` : 'none',
                      display: 'inline-block',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    {formatCurrency(item.value)}
                  </span>
                </div>
              );
            })() : (() => {
              const activeSlice = (lockedTooltip ? lockedTooltip.slice : hoveredSlice)!;
              return (
                <>
                  <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block' }}>
                      {activeSlice === 'income' ? 'Receitas Totais' : 'Despesas Totais'}
                    </span>
                    <span style={{ fontSize: '1.3rem', color: activeSlice === 'income' ? '#4ade80' : '#be123c', fontWeight: 'bold' }}>
                      {formatCurrency(activeSlice === 'income' ? totalIncome : totalExpense)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(activeSlice === 'income' ? incomeData : expenseData).map(cat => (
                      <div key={cat.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                          <span style={{ filter: 'grayscale(100%)', opacity: 0.8, marginRight: '8px' }}>{cat.emoji}</span>
                          {cat.label}
                        </span>
                        
                        <span 
                          contentEditable={!!lockedTooltip}
                          suppressContentEditableWarning
                          onBlur={(e) => handleContentEdit(e, cat.label, cat.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                          style={{ 
                            fontSize: '1.05rem', color: cat.color, fontWeight: 'bold', 
                            cursor: lockedTooltip ? 'text' : 'default', 
                            outline: 'none',
                            borderBottom: lockedTooltip ? `1px dashed ${cat.color}80` : 'none',
                            transition: 'border-color 0.2s',
                            textAlign: 'right',
                            minWidth: '60px'
                          }}
                        >
                          {formatCurrency(cat.value)}
                        </span>
                      </div>
                    ))}
                    {((activeSlice === 'income' && incomeData.length === 0) || (activeSlice === 'expense' && expenseData.length === 0)) && (
                      <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Nenhum dado</span>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

