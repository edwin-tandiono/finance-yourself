export type Expense = {
  id: string;
  amount: number;
  category: string;
  date: Date;
  description: string;
};

export type CreateExpensePayload = {
  amount: number;
  category: string;
  date: Date;
  description: string;
};
