import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';

interface Props {
  isOpen: boolean;
  transactionToEdit: Transaction | null;
  onClose: () => void;
  onSaveTransaction: (transaction: Transaction) => void;
}

const PREDEFINED_CATEGORIES = [
  'Salário', 'Mercado', 'Moradia', 'Transporte', 'Alimentação', 
  'Saúde', 'Lazer', 'Educação', 'Pix', 'Outra'
];

export default function TransactionModal({ isOpen, transactionToEdit, onClose, onSaveTransaction }: Props) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(PREDEFINED_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');

  // Sincroniza os dados caso estejamos a editar
  useEffect(() => {
    if (isOpen && transactionToEdit) {
      setTitle(transactionToEdit.title);
      setAmount(transactionToEdit.amount.toString());
      setType(transactionToEdit.type);
      
      if (PREDEFINED_CATEGORIES.includes(transactionToEdit.category) && transactionToEdit.category !== 'Outra') {
        setCategory(transactionToEdit.category);
        setCustomCategory('');
      } else {
        setCategory('Outra');
        setCustomCategory(transactionToEdit.category);
      }
    } else if (isOpen) {
      // Limpar form quando é nova transação
      setTitle('');
      setAmount('');
      setType('expense');
      setCategory(PREDEFINED_CATEGORIES[0]);
      setCustomCategory('');
    }
  }, [isOpen, transactionToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    let finalCategory = category;
    if (category === 'Outra') {
      finalCategory = customCategory.trim() || 'Outra';
    }

    const savedTransaction: Transaction = {
      id: transactionToEdit ? transactionToEdit.id : crypto.randomUUID(),
      title,
      amount: parseFloat(amount),
      type,
      category: finalCategory,
      date: transactionToEdit ? transactionToEdit.date : new Date().toISOString()
    };

    onSaveTransaction(savedTransaction);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '32px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem', fontFamily: 'Outfit, sans-serif' }}>
            {transactionToEdit ? 'Editar Transação' : 'Nova Transação'}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.8rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>Descrição</label>
            <input 
              className="auth-input" 
              type="text" 
              placeholder="Ex: Conta de Luz" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>Valor (R$)</label>
            <input 
              className="auth-input" 
              type="number" 
              step="0.01" 
              min="0.01"
              placeholder="0.00" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>Tipo</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                type="button" 
                style={{
                  padding: '12px', borderRadius: '8px', fontWeight: 600, border: '1px solid',
                  backgroundColor: type === 'income' ? 'rgba(148, 209, 190, 0.1)' : 'transparent',
                  borderColor: type === 'income' ? 'var(--pearl-aqua)' : 'var(--border)',
                  color: type === 'income' ? 'var(--pearl-aqua)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onClick={() => setType('income')}
              >
                Entrada
              </button>
              <button 
                type="button" 
                style={{
                  padding: '12px', borderRadius: '8px', fontWeight: 600, border: '1px solid',
                  backgroundColor: type === 'expense' ? 'rgba(157, 181, 178, 0.1)' : 'transparent',
                  borderColor: type === 'expense' ? 'var(--ash-grey)' : 'var(--border)',
                  color: type === 'expense' ? 'var(--ash-grey)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onClick={() => setType('expense')}
              >
                Saída
              </button>
            </div>
          </div>

          <div className="form-group">
            <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>Categoria</label>
            <select 
              className="auth-input" 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              required
              style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', cursor: 'pointer' }}
            >
              {PREDEFINED_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {category === 'Outra' && (
            <div className="form-group" style={{ marginTop: '-4px', animation: 'fadeIn 0.3s' }}>
              <label style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 500 }}>Nome da Categoria</label>
              <input 
                className="auth-input" 
                type="text" 
                placeholder="Ex: Investimentos" 
                maxLength={20}
                value={customCategory} 
                onChange={e => setCustomCategory(e.target.value)} 
              />
            </div>
          )}

          <button type="submit" className="button button--primary" style={{ marginTop: '16px', minHeight: '48px', fontSize: '1rem' }}>
            {transactionToEdit ? 'Atualizar Transação' : 'Salvar Transação'}
          </button>
        </form>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
