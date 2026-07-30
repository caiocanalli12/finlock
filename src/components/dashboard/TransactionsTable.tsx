import React from 'react';
import { Transaction } from '../../types';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionsTable({ transactions, onEdit, onDelete }: Props) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
  };

  return (
    <div style={{ 
      overflowX: 'auto',
      marginBottom: '2rem'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(157, 181, 178, 0.05)' }}>
            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descrição</th>
            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor</th>
            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoria</th>
            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data</th>
            <th style={{ padding: '16px 24px', width: '100px', textAlign: 'right' }}></th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Nenhuma transação encontrada.
              </td>
            </tr>
          ) : (
            transactions.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s ease' }} className="table-row">
                <td style={{ padding: '16px 24px', color: 'var(--text-main)', fontWeight: 500 }}>{t.title}</td>
                <td style={{ 
                  padding: '16px 24px', 
                  color: t.type === 'income' ? 'var(--income-color, var(--evergreen))' : '#e74c3c',
                  fontWeight: 'bold',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.05rem'
                }} className={t.type === 'income' ? 'text-income' : ''}>
                  {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-main)' }}>
                  <span style={{ backgroundColor: 'rgba(157, 181, 178, 0.1)', padding: '4px 10px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 500 }}>
                    {t.category}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{formatDate(t.date)}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button className="action-btn edit-btn" title="Editar" onClick={() => onEdit(t)}>
                      <Pencil size={16} />
                    </button>
                    <button className="action-btn delete-btn" title="Excluir" onClick={() => onDelete(t.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <style>{`
        .table-row:last-child {
          border-bottom: none !important;
        }
        .table-row:hover {
          background-color: rgba(157, 181, 178, 0.08);
        }
        
        /* Ações */
        .action-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .action-btn.edit-btn:hover {
          color: var(--primary);
          background-color: rgba(157, 181, 178, 0.15);
        }
        .action-btn.delete-btn:hover {
          color: #e74c3c;
          background-color: rgba(231, 76, 60, 0.1);
        }

        /* Variável adaptável para o modo claro e escuro (Receitas) */
        .text-income {
          color: var(--evergreen) !important;
        }
        :root[data-theme="dark"] .text-income {
          color: var(--pearl-aqua) !important;
        }
      `}</style>
    </div>
  );
}
