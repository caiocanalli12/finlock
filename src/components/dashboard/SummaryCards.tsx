import React from 'react';
import { Transaction } from '../../types';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export default function SummaryCards({ transactions }: Props) {
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
      
      {/* Cartão de Saldo */}
      <article className="balance-card" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={18} />
            Saldo disponível
          </span>
        </div>
        <strong>{formatCurrency(balance)}</strong>
      </article>

      {/* Cartão de Receitas */}
      <article className="balance-card balance-card--thin" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="var(--evergreen)" />
          Receitas
        </span>
        <strong style={{ color: 'var(--evergreen)' }}>{formatCurrency(income)}</strong>
      </article>

      {/* Cartão de Despesas */}
      <article className="balance-card balance-card--thin" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingDown size={18} color="#e74c3c" />
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
