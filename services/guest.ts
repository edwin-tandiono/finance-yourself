import type { Expense } from 'types/models/expense';

const INITIAL_DATA: Expense[] = [
  {
    id: new Date().getTime().toString(),
    amount: 50000,
    date: new Date(),
    category: 'food',
    description: 'fried rice',
  },
  {
    id: (new Date().getTime() + 1).toString(),
    amount: 100000,
    date: new Date(),
    category: 'utilities',
    description: 'gas',
  },
];

export const signInAsGuest = () => {
  window.sessionStorage.setItem('isSignedInAsGuest', '1');
};

export const isSignedInAsGuest = () => {
  return window.sessionStorage.getItem('isSignedInAsGuest') === '1';
};

export const getAllExpenses = () => {
  const expenses = window.sessionStorage.getItem('expenses');

  if (!expenses) {
    window.sessionStorage.setItem('expenses', JSON.stringify(INITIAL_DATA));

    return INITIAL_DATA;
  }

  try {
    return JSON.parse(expenses)
      .map((expense: Expense) => ({ ...expense, date: new Date(expense.date) }))
      .sort((a: { date: Date }, b: { date: Date }) => a.date.getTime() - b.date.getTime());
  } catch {
    window.sessionStorage.setItem('expenses', JSON.stringify(INITIAL_DATA));

    return INITIAL_DATA;
  }
};

export const getExpenses = async (date = new Date()) => {
  const expenses = getAllExpenses();

  return expenses
    .filter((expense: Expense) => (
      expense.date.getMonth() === date.getMonth()
      && expense.date.getFullYear() === date.getFullYear()
    ));
};

export const createExpense = async (expense: Omit<Expense, 'id'>) => {
  const expenses = await getAllExpenses();

  expenses.push({
    id: new Date().getTime().toString(),
    ...expense,
  });

  const sortedNewExpenses = expenses
    .sort((a: { date: string }, b: { date: string }) => new Date(a.date).getTime() - new Date(b.date).getTime());

  window.sessionStorage.setItem('expenses', JSON.stringify(sortedNewExpenses));
};

export const updateExpense = async (id: string, expense: Omit<Expense, 'id'>) => {
  const expenses = await getAllExpenses();

  const expenseToUpdate = expenses.find((existingExpense: Expense) => existingExpense.id === id);

  if (!expenseToUpdate) {
    createExpense(expense);

    return;
  }

  expenseToUpdate.amount = expense.amount;
  expenseToUpdate.categeory = expense.category;
  expenseToUpdate.date = expense.date;
  expenseToUpdate.description = expense.description;

  window.sessionStorage.setItem('expenses', JSON.stringify(expenses));
};

export const deleteExpense = async (id: string) => {
  const expenses = await getAllExpenses();

  const targetExpenseIndex = expenses.findIndex((expense: Expense) => expense.id === id);

  if (targetExpenseIndex === -1) {
    return;
  }

  expenses.splice(targetExpenseIndex, 1);

  window.sessionStorage.setItem('expenses', JSON.stringify(expenses));
};
