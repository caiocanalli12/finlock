import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import logobranca from '../../assets/logobranca.png';
import '../../pages/auth.css';

interface Props {
  isOpen: boolean;
  transactionToEdit: Transaction | null;
  onClose: () => void;
  onSaveTransaction: (transaction: Transaction) => void;
}

const PREDEFINED_CATEGORIES = ['Salário', 'Mercado', 'Moradia', 'Transporte', 'Alimentação', 'Saúde', 'Lazer', 'Educação', 'Pix', 'Outra'];

export default function TransactionModal({ isOpen, transactionToEdit, onClose, onSaveTransaction }: Props) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(PREDEFINED_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(new Date().getDate());

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
      setIsRecurring(false);
      setRecurringDay(new Date().getDate());
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
      date: transactionToEdit ? transactionToEdit.date : new Date().toISOString(),
      is_recurring: !transactionToEdit ? isRecurring : undefined,
      recurring_day: (!transactionToEdit && isRecurring) ? recurringDay : undefined
    };

    onSaveTransaction(savedTransaction);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      animation: 'fadeInOverlay 0.3s ease'
    }}>
      <div 
        className="auth-card" 
        style={{ 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          position: 'relative',
          animation: 'scaleInCard 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', top: '24px', right: '24px', 
            background: 'transparent', border: 'none', color: 'var(--text-muted)', 
            fontSize: '1.8rem', cursor: 'pointer', lineHeight: 1,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          &times;
        </button>

        <div className="auth-logo" style={{ pointerEvents: 'none', marginBottom: '20px' }}>
          <img src={logobranca} alt="FinLock Logo" style={{ height: '32px' }} />
        </div>
        
        <div className="auth-header" style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>{transactionToEdit ? 'Editar Transação' : 'Nova Transação'}</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Preencha os detalhes financeiros</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Descrição</label>
            <input 
              type="text" 
              placeholder="Ex: Conta de Luz" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required
              style={{
                width: '100%', padding: '12px 0', fontSize: '1.1rem',
                border: 'none', borderBottom: '1.5px solid var(--border)',
                backgroundColor: 'transparent', color: 'var(--text-main)',
                outline: 'none', transition: 'border-color 0.3s'
              }}
              onFocus={e => e.currentTarget.style.borderBottom = '1.5px solid var(--primary)'}
              onBlur={e => e.currentTarget.style.borderBottom = '1.5px solid var(--border)'}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Valor (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              min="0.01"
              placeholder="0,00" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              required
              style={{
                width: '100%', padding: '12px 0', fontSize: '1.8rem', fontWeight: 700,
                border: 'none', borderBottom: '1.5px solid var(--border)',
                backgroundColor: 'transparent', color: type === 'income' ? 'var(--pearl-aqua)' : 'var(--text-main)',
                outline: 'none', transition: 'all 0.3s'
              }}
              onFocus={e => e.currentTarget.style.borderBottom = '1.5px solid var(--primary)'}
              onBlur={e => e.currentTarget.style.borderBottom = '1.5px solid var(--border)'}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tipo</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button 
                type="button" 
                style={{
                  padding: '14px', borderRadius: '12px', fontWeight: 600, border: '1.5px solid',
                  backgroundColor: type === 'income' ? 'var(--primary)' : 'transparent',
                  borderColor: type === 'income' ? 'var(--primary)' : 'var(--border)',
                  color: type === 'income' ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: type === 'income' ? '0 4px 12px rgba(148, 209, 190, 0.3)' : 'none',
                  transform: type === 'income' ? 'translateY(-2px)' : 'none'
                }}
                onClick={() => setType('income')}
              >
                Entrada
              </button>
              <button 
                type="button" 
                style={{
                  padding: '14px', borderRadius: '12px', fontWeight: 600, border: '1.5px solid',
                  backgroundColor: type === 'expense' ? 'var(--text-main)' : 'transparent',
                  borderColor: type === 'expense' ? 'var(--text-main)' : 'var(--border)',
                  color: type === 'expense' ? 'var(--bg-main)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: type === 'expense' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
                  transform: type === 'expense' ? 'translateY(-2px)' : 'none'
                }}
                onClick={() => setType('expense')}
              >
                Saída
              </button>
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Categoria</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              required
              style={{ 
                width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 500,
                borderRadius: '12px', border: '1.5px solid var(--border)', 
                backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', 
                cursor: 'pointer', outline: 'none', appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px top 50%', backgroundSize: '12px auto',
                transition: 'border-color 0.3s'
              }}
              onFocus={e => e.currentTarget.style.border = '1.5px solid var(--primary)'}
              onBlur={e => e.currentTarget.style.border = '1.5px solid var(--border)'}
            >
              {PREDEFINED_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {category === 'Outra' && (
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px', animation: 'fadeIn 0.3s' }}>
              <label style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nome da Categoria</label>
              <input 
                type="text" 
                placeholder="Ex: Investimentos" 
                maxLength={20}
                value={customCategory} 
                onChange={e => setCustomCategory(e.target.value)}
                style={{
                  width: '100%', padding: '12px 0', fontSize: '1.1rem',
                  border: 'none', borderBottom: '1.5px solid var(--border)',
                  backgroundColor: 'transparent', color: 'var(--text-main)',
                  outline: 'none', transition: 'border-color 0.3s'
                }}
                onFocus={e => e.currentTarget.style.borderBottom = '1.5px solid var(--primary)'}
                onBlur={e => e.currentTarget.style.borderBottom = '1.5px solid var(--border)'}
              />
            </div>
          )}

          {!transactionToEdit && (
            <div style={{ marginTop: '8px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div className="form-group" style={{ marginBottom: isRecurring ? '16px' : '0' }}>
                <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', margin: 0 }}>
                  <span>Repetir todo mês (Plano/Assinatura)</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </label>
              </div>

              {isRecurring && (
                <div className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
                  <label style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 500 }}>
                    Dia do Mês (1 a 31)
                  </label>
                  <input 
                    className="auth-input" 
                    type="number" 
                    min="1"
                    max="31"
                    value={recurringDay} 
                    onChange={e => setRecurringDay(parseInt(e.target.value) || 1)} 
                    required={isRecurring}
                  />
                </div>
              )}
            </div>
          )}

          <button 
            type="submit" 
            style={{ 
              marginTop: '10px', minHeight: '52px', fontSize: '1.05rem', 
              borderRadius: '9999px', background: 'linear-gradient(135deg, var(--pearl-aqua), #7bc4ae)',
              color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(123, 196, 174, 0.4)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 196, 174, 0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(123, 196, 174, 0.4)';
            }}
          >
            {transactionToEdit ? 'Atualizar Transação' : 'Salvar Transação'}
          </button>
        </form>
        <style>{`
          @keyframes fadeInOverlay {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleInCard {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

