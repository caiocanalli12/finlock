import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import SummaryCards from '../components/dashboard/SummaryCards';
import DashboardChart from '../components/dashboard/DashboardChart';
import TransactionsTable from '../components/dashboard/TransactionsTable';
import TransactionModal from '../components/dashboard/TransactionModal';
import { Plus } from 'lucide-react';

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Salário', amount: 5800, type: 'income', category: 'Salário', date: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: '2', title: 'Mercado', amount: 324.50, type: 'expense', category: 'Alimentação', date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '3', title: 'Internet', amount: 109, type: 'expense', category: 'Moradia', date: new Date().toISOString() }
];

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedInitialBalance = localStorage.getItem('finlock_initial_balance');
    if (savedInitialBalance) {
      const parsedBalance = parseFloat(savedInitialBalance);
      if (!isNaN(parsedBalance) && parsedBalance > 0) {
        return [
          {
            id: 'initial-balance',
            title: 'Saldo Inicial (Onboarding)',
            amount: parsedBalance,
            type: 'income',
            category: 'Receita',
            date: new Date().toISOString()
          },
          ...INITIAL_TRANSACTIONS
        ];
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const availablePeriods = Array.from(new Set(transactions.map(t => {
    const d = new Date(t.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))).sort().reverse();
  
  if (!availablePeriods.includes(selectedPeriod)) {
    availablePeriods.unshift(selectedPeriod);
    availablePeriods.sort().reverse();
  }

  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    const p = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return p === selectedPeriod;
  });

  useEffect(() => {
    const handleOpenModal = () => {
      setTransactionToEdit(null);
      setIsModalOpen(true);
    };

    const handleAddDirect = (e: Event) => {
      const customEvent = e as CustomEvent<Transaction>;
      if (customEvent.detail) {
        setTransactions(prev => [customEvent.detail, ...prev]);
      }
    };

    window.addEventListener('open-transaction-modal', handleOpenModal);
    window.addEventListener('add-direct-transaction', handleAddDirect);

    return () => {
      window.removeEventListener('open-transaction-modal', handleOpenModal);
      window.removeEventListener('add-direct-transaction', handleAddDirect);
    };
  }, []);

  const handleSaveTransaction = (transaction: Transaction) => {
    if (transactionToEdit) {
      // Editar
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    } else {
      // Adicionar
      setTransactions(prev => [transaction, ...prev]);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  };

  const handleCategoryUpdate = (categoryLabel: string, newValue: number) => {
    if (isNaN(newValue)) return;
    
    // Find all transactions for this category in the current period
    const txsInCategory = filteredTransactions.filter(t => t.category === categoryLabel);
    if (txsInCategory.length === 0) return;

    // Safely update the category total:
    // Update the first transaction with the new total value and remove any duplicates
    // This perfectly overrides whatever sum was there with the user's explicit input
    const firstTx = txsInCategory[0];
    const otherTxIds = txsInCategory.slice(1).map(t => t.id);

    setTransactions(prev => prev
      .filter(t => !otherTxIds.includes(t.id))
      .map(t => t.id === firstTx.id ? { ...t, amount: newValue } : t)
    );
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem a certeza que pretende excluir esta transação?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div style={{ paddingBottom: '100px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--text-main)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Visão Geral</h2>
      </div>
      
      <SummaryCards transactions={filteredTransactions} />
      
      <DashboardChart 
        transactions={filteredTransactions} 
        selectedPeriod={selectedPeriod}
        availablePeriods={availablePeriods}
        onPeriodChange={setSelectedPeriod}
        onCategoryUpdate={handleCategoryUpdate}
      />
      
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ 
          color: 'var(--text-main)', fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif', margin: 0,
          textDecoration: 'underline', textDecorationColor: 'var(--primary)', textDecorationThickness: '3px', textUnderlineOffset: '8px'
        }}>
          Histórico de Transações
        </h3>
      </div>
      <TransactionsTable 
        transactions={filteredTransactions} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TransactionModal 
        isOpen={isModalOpen} 
        transactionToEdit={transactionToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setTransactionToEdit(null);
        }} 
        onSaveTransaction={handleSaveTransaction} 
      />

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => { setTransactionToEdit(null); setIsModalOpen(true); }}
        style={{ 
          position: 'fixed', bottom: '40px', right: '40px', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--primary)', color: '#ffffff', 
          border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0, 38, 38, 0.3)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 38, 38, 0.4)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 38, 38, 0.3)'; }}
        title="Adicionar Transação"
      >
        <Plus size={28} strokeWidth={3} />
      </button>
    </div>
  );
}
