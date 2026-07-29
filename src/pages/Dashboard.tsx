import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import SummaryCards from '../components/dashboard/SummaryCards';
import TransactionsTable from '../components/dashboard/TransactionsTable';
import TransactionModal from '../components/dashboard/TransactionModal';

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Salário', amount: 5800, type: 'income', category: 'Receita', date: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: '2', title: 'Mercado', amount: 324.50, type: 'expense', category: 'Alimentação', date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '3', title: 'Internet', amount: 109, type: 'expense', category: 'Moradia', date: new Date().toISOString() }
];

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  useEffect(() => {
    const handleOpenModal = () => {
      setTransactionToEdit(null);
      setIsModalOpen(true);
    };
    window.addEventListener('open-transaction-modal', handleOpenModal);
    return () => window.removeEventListener('open-transaction-modal', handleOpenModal);
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

  const handleDelete = (id: string) => {
    if (window.confirm('Tem a certeza que pretende excluir esta transação?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--text-main)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Visão Geral</h2>
      </div>
      
      <SummaryCards transactions={transactions} />
      
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif', margin: 0 }}>Histórico de Transações</h3>
      </div>
      <TransactionsTable 
        transactions={transactions} 
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
    </div>
  );
}
