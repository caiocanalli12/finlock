import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import SummaryCards from '../components/dashboard/SummaryCards';
import DashboardChart from '../components/dashboard/DashboardChart';
import TransactionsTable from '../components/dashboard/TransactionsTable';
import TransactionModal from '../components/dashboard/TransactionModal';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Salário', amount: 5800, type: 'income', category: 'Salário', date: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: '2', title: 'Mercado', amount: 324.50, type: 'expense', category: 'Alimentação', date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '3', title: 'Internet', amount: 109, type: 'expense', category: 'Moradia', date: new Date().toISOString() }
];

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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
    const checkUserAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchTransactions(user.id);
      } else {
        setIsLoading(false);
      }
    };
    checkUserAndFetch();

    const handleOpenModal = () => {
      setTransactionToEdit(null);
      setIsModalOpen(true);
    };

    const handleAddDirect = async (e: Event) => {
      const customEvent = e as CustomEvent<Transaction>;
      if (customEvent.detail) {
        const t = customEvent.detail;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('transactions')
            .insert([{ user_id: user.id, title: t.title, amount: t.amount, type: t.type, category: t.category, date: t.date }])
            .select()
            .single();
          if (data && !error) {
            setTransactions(prev => [data, ...prev]);
          }
        }
      }
    };

    window.addEventListener('open-transaction-modal', handleOpenModal);
    window.addEventListener('add-direct-transaction', handleAddDirect);

    return () => {
      window.removeEventListener('open-transaction-modal', handleOpenModal);
      window.removeEventListener('add-direct-transaction', handleAddDirect);
    };
  }, []);

  const fetchTransactions = async (uid?: string) => {
    setIsLoading(true);
    const targetUserId = uid || userId;
    
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (data && !error) {
      let currentTransactions = data as Transaction[];
      
      // Auto-Salary Check
      const { data: userData } = await supabase
        .from('usuarios')
        .select('salary_amount, auto_salary_enabled, auto_salary_day')
        .eq('id', targetUserId)
        .single();
        
      if (userData?.auto_salary_enabled && userData.salary_amount > 0) {
        const today = new Date();
        const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        
        // Verifica se hoje >= dia estipulado
        if (today.getDate() >= userData.auto_salary_day) {
          // Verifica se já existe um Salário neste mês (independente de ser automático ou não)
          const salaryExistsThisMonth = currentTransactions.some(t => {
            return t.category === 'Salário' && t.date.startsWith(currentMonthPrefix);
          });
          
          if (!salaryExistsThisMonth) {
            // Lançar salário automaticamente
            const autoSalaryDate = new Date(today.getFullYear(), today.getMonth(), userData.auto_salary_day, 8, 0, 0).toISOString();
            const { data: newSalary, error: insertError } = await supabase
              .from('transactions')
              .insert([{ 
                user_id: targetUserId, 
                title: 'Salário (Automático)', 
                amount: userData.salary_amount, 
                type: 'income', 
                category: 'Salário', 
                date: autoSalaryDate 
              }])
              .select()
              .single();
              
            if (newSalary && !insertError) {
              currentTransactions = [newSalary, ...currentTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            }
          }
        }
      }
      
      // Auto-Recurring Checks
      const { data: recurringData } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', targetUserId);
        
      if (recurringData && recurringData.length > 0) {
        const today = new Date();
        const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        
        let newRecurringsAdded = false;

        for (const rec of recurringData) {
          if (today.getDate() >= rec.recurring_day) {
            // Check if this recurring transaction has already been posted this month
            const alreadyPosted = currentTransactions.some(t => {
              return t.recurring_source_id === rec.id && t.date.startsWith(currentMonthPrefix);
            });
            
            if (!alreadyPosted) {
              const autoRecDate = new Date(today.getFullYear(), today.getMonth(), rec.recurring_day, 8, 0, 0).toISOString();
              const { data: newRecTx, error: recInsertError } = await supabase
                .from('transactions')
                .insert([{
                  user_id: targetUserId,
                  title: rec.title,
                  amount: rec.amount,
                  type: rec.type,
                  category: rec.category,
                  date: autoRecDate,
                  recurring_source_id: rec.id
                }])
                .select()
                .single();
                
              if (newRecTx && !recInsertError) {
                currentTransactions.push(newRecTx);
                newRecurringsAdded = true;
              }
            }
          }
        }
        
        if (newRecurringsAdded) {
          currentTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
      }

      setTransactions(currentTransactions);
    }
    setIsLoading(false);
  };

  const handleSaveTransaction = async (transaction: Transaction) => {
    if (!userId) return;

    if (transactionToEdit) {
      // Editar
      const { data, error } = await supabase
        .from('transactions')
        .update({ title: transaction.title, amount: transaction.amount, type: transaction.type, category: transaction.category, date: transaction.date })
        .eq('id', transaction.id)
        .select()
        .single();
        
      if (data && !error) {
        setTransactions(prev => prev.map(t => t.id === transaction.id ? data : t));
      }
    } else {
      // Adicionar
      let recurringSourceId = null;

      // Se for recorrente, criamos o template primeiro
      if (transaction.is_recurring && transaction.recurring_day) {
        const { data: recData, error: recError } = await supabase
          .from('recurring_transactions')
          .insert([{
            user_id: userId,
            title: transaction.title,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            recurring_day: transaction.recurring_day
          }])
          .select()
          .single();
          
        if (recData && !recError) {
          recurringSourceId = recData.id;
        }
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([{ 
          user_id: userId, 
          title: transaction.title, 
          amount: transaction.amount, 
          type: transaction.type, 
          category: transaction.category, 
          date: transaction.date,
          recurring_source_id: recurringSourceId
        }])
        .select()
        .single();
        
      if (data && !error) {
        setTransactions(prev => [data, ...prev]);
      }
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  };

  const handleCategoryUpdate = async (categoryLabel: string, newValue: number) => {
    if (isNaN(newValue) || !userId) return;
    
    const txsInCategory = filteredTransactions.filter(t => t.category === categoryLabel);
    if (txsInCategory.length === 0) return;

    const firstTx = txsInCategory[0];
    const otherTxIds = txsInCategory.slice(1).map(t => t.id);

    // Update the first transaction locally
    setTransactions(prev => prev
      .filter(t => !otherTxIds.includes(t.id))
      .map(t => t.id === firstTx.id ? { ...t, amount: newValue } : t)
    );

    // Update in Supabase
    await supabase.from('transactions').update({ amount: newValue }).eq('id', firstTx.id);

    // Delete duplicates in Supabase if there are any
    if (otherTxIds.length > 0) {
      await supabase.from('transactions').delete().in('id', otherTxIds);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem a certeza que pretende excluir esta transação?')) {
      // Remove locally for immediate UI update
      setTransactions(prev => prev.filter(t => t.id !== id));
      // Delete in Supabase
      await supabase.from('transactions').delete().eq('id', id);
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
