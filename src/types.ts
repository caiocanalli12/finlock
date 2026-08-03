export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  is_recurring?: boolean;
  recurring_day?: number;
  recurring_source_id?: string;
}
