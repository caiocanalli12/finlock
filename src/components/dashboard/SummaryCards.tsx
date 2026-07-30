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

  const delicateBgStyle = {
    background: theme === 'dark' ? '#003636' : 'var(--bg-main)',
    borderRadius: '24px',
    border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
    boxShadow: theme === 'dark' ? '0 20px 50px rgba(0,0,0,0.4)' : '0 20px 50px rgba(0,0,0,0.06)',
    padding: '28px 32px',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
      
      {/* Cartão de Saldo */}
      <article className="balance-card" style={{ position: 'relative', ...delicateBgStyle }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={18} />
            Saldo disponível
          </span>
        </div>
        <strong>{formatCurrency(balance)}</strong>
      </article>

      {/* Cartão de Receitas */}
      <article className="balance-card balance-card--thin" style={{ color: 'var(--text-main)', ...delicateBgStyle }}>
        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUp size={18} color="var(--evergreen)" strokeWidth={3} />
          Receitas
        </span>
        <strong style={{ color: 'var(--evergreen)' }}>{formatCurrency(income)}</strong>
      </article>

      {/* Cartão de Despesas */}
      <article className="balance-card balance-card--thin" style={{ color: 'var(--text-main)', ...delicateBgStyle }}>
        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowDown size={18} color="#e74c3c" strokeWidth={3} />
          Despesas
        </span>
        <strong style={{ color: '#e74c3c' }}>{formatCurrency(expense)}</strong>
      </article>

      <style>{`
        /* Ajuste para o Dark Mode, pois o --evergreen nas receitas fica escuro demais no fundo onyx */
        :root[data-theme="dark"] .balance-card--thin:nth-child(2) strong,
        :root[data-theme="dark"] .balance-card--thin:nth-child(2) span svg {
          color: var(--pearl-aqua) !important;
        }
      `}</style>
    </div>
  );
}
