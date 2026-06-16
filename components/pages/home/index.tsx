import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import ErrorMessage from 'components/common/error-message';
import Logo from 'components/common/logo';
import styles from 'components/pages/home/HomePage.module.scss';
import Navbar from 'components/pages/home/navbar';
import {
  listenOnAuthStateChanged,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from 'services/firebase';
import { hideAppLoader, showAppLoader } from 'utils/loader';

import ExpenseForm from './expense/form';
import ExpenseList from './expense/list';

import type { CreateExpensePayload, Expense } from 'types/models/expense';


export default function HomePage() {
  const navigate = useNavigate();

  const [authenticated, setAuthenticated] = useState(false);
  const [starting, setStarting] = useState(true);
  const [month, setMonth] = useState(new Date());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentOpenExpense, setCurrentOpenExpense] = useState<Expense|undefined>();
  const [expenseFormOpen, setExpenseFormOpen] = useState<boolean>(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const catchError = (error: unknown) => {
    if (error instanceof Error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage(String(error));
    }
  };

  const handleFetchList = () => {
    if (!starting) {
      if (expenses.length === 0) {
        showAppLoader();
      } else {
        setSyncing(true);
      }
    }

    setCurrentOpenExpense(undefined);
    setExpenseFormOpen(false);
    setErrorMessage('');

    getExpenses(month)
      .then(setExpenses)
      .catch(catchError)
      .finally(() => {
        setStarting(false);
        setSyncing(false);
        hideAppLoader();
      });
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

  const handleDelete = (expense: Expense) => {
    showAppLoader();
    setErrorMessage('');

    deleteExpense(expense.id)
      .then(handleFetchList)
      .catch(catchError)
      .finally(hideAppLoader);
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

  if (starting) {
    return (
      <div className={styles['starting-container']}>
        <Logo animated />
      </div>
    );
  }

  return (
    <div>
      <div className={expenseFormOpen ? styles['show'] : styles['hide']}>
        <ExpenseForm
          onClose={() => {
            setExpenseFormOpen(false);
            setCurrentOpenExpense(undefined);
          }}
          onDelete={handleDelete}
          onSubmit={handleUpsert}
          open={expenseFormOpen}
          prefill={currentOpenExpense}
        />
      </div>
      <div className={expenseFormOpen ? styles['hide'] : styles['show']}>
        <Navbar
          month={month}
          onChangeMonth={(newMonth) => {
            setMonth(newMonth);
            setExpenses([]);
          }}
        />

        {syncing && (
          <div className={styles['sync-indicator']}>
            <center><i>Syncing expenses ...</i></center>
          </div>
        )}

        <ErrorMessage>{errorMessage}</ErrorMessage>

        <ExpenseList
          data={expenses}
          onClick={(expense) => {
            setCurrentOpenExpense(expense);
            setExpenseFormOpen(true);
          }}
        />
      </div>
    </div>
  ); 
}