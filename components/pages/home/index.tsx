import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import ErrorMessage from 'components/common/error-message';
import Navbar from 'components/pages/home/navbar';
import {
  listenOnAuthStateChanged,
  getExpenses,
  createExpense,
  updateExpense,
} from 'services/firebase';
import { hideAppLoader, showAppLoader } from 'utils/loader';

import ExpenseForm from './expense/form';
import ExpenseList from './expense/list';

import type { CreateExpensePayload, Expense } from 'types/models/expense';


export default function HomePage() {
  const navigate = useNavigate();

  const [authenticated, setAuthenticated] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentOpenExpense, setCurrentOpenExpense] = useState<Expense|undefined>();
  const [expenseFormOpen, setExpenseFormOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState('');

  const catchError = (error: unknown) => {
    if (error instanceof Error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage(String(error));
    }
  };

  const handleFetchList = () => {
    showAppLoader();
    setExpenses([]);    
    setCurrentOpenExpense(undefined);
    setExpenseFormOpen(false);
    setErrorMessage('');
    getExpenses(month)
      .then(setExpenses)
      .catch(catchError)
      .finally(hideAppLoader);
  };

  const handleUpsert = (expense: Expense | CreateExpensePayload) => {
    showAppLoader();
    setErrorMessage('');

    if ('id' in expense) {
      updateExpense(expense.id, expense)
        .then(() => setMonth(expense.date))
        .then(handleFetchList)
        .catch(catchError)
        .finally(hideAppLoader);
    } else {
      createExpense(expense)
        .then(() => setMonth(expense.date))
        .then(handleFetchList)
        .catch(catchError)
        .finally(hideAppLoader);
    }
  };

  // On mount
  useEffect(() => {
    listenOnAuthStateChanged({
      onLoggedIn: () => setAuthenticated(true),
      onLoggedOut: () => navigate('/login', { replace: true }),
    });
  }, []);

  // On authenticated & month changed
  useEffect(() => {
    if (authenticated) {
      handleFetchList();
    }
  }, [authenticated, month]);

  return (
    <div>
      <Navbar month={month} onChangeMonth={setMonth} />

      <ErrorMessage>{errorMessage}</ErrorMessage>

      <ExpenseList
        data={expenses} 
        onClick={(expense) => {
          setCurrentOpenExpense(expense);
          setExpenseFormOpen(true);
        }}
        />

      <ExpenseForm
        onClose={() => {
          setExpenseFormOpen(false);
          setCurrentOpenExpense(undefined);
        }}
        onSubmit={handleUpsert}
        open={expenseFormOpen}
        prefill={currentOpenExpense}
      />
    </div>
  ); 
}