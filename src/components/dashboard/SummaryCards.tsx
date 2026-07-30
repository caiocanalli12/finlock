import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Transaction } from '../../types';
import { Wallet, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export default function SummaryCards({ transactions }: Props) {
  const { theme } = useTheme();

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const translucentCardStyle = {
    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '24px',
    border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: theme === 'dark' ? '0 12px 40px rgba(0,0,0,0.2)' : '0 12px 40px rgba(0, 38, 38, 0.04)',
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  const incomeColor = '#4ade80';
  const positiveBalanceColor = '#4ade80'; 
  const balanceColor = balance >= 0 ? positiveBalanceColor : '#e74c3c';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
      
      {/* Cartão de Saldo */}
      <article className="balance-card" style={{ position: 'relative', ...translucentCardStyle }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
            <Wallet size={20} />
            Saldo disponível
          </span>
        </div>
        <strong style={{ fontSize: '2rem', color: balanceColor }}>{formatCurrency(balance)}</strong>
      </article>

      {/* Cartão de Receitas */}
      <article className="balance-card balance-card--thin" style={{ color: 'var(--text-main)', ...translucentCardStyle }}>
        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
          <ArrowUp size={20} color={incomeColor} strokeWidth={3} />
          Receitas
        </span>
        <strong style={{ color: incomeColor, fontSize: '2rem' }}>{formatCurrency(income)}</strong>
      </article>

      {/* Cartão de Despesas */}
      <article className="balance-card balance-card--thin" style={{ color: 'var(--text-main)', ...translucentCardStyle }}>
        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
          <ArrowDown size={20} color="#e74c3c" strokeWidth={3} />
          Despesas
        </span>
        <strong style={{ color: '#e74c3c', fontSize: '2rem' }}>{formatCurrency(expense)}</strong>
      </article>
    </div>
  );
}
