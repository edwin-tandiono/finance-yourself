import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import Navbar from 'components/pages/home/navbar';
import {
  listenOnAuthStateChanged,
  getExpenses,
} from 'services/firebase';

import ExpenseList from './expense/list';

import type { Expense } from 'types/models/expense';


export default function HomePage() {
  const navigate = useNavigate();

  const [authenticated, setAuthenticated] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [expenses, setExpenses] = useState<Expense[]>([]);

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
      setExpenses([]);
      getExpenses(month).then(setExpenses);
    }
  }, [authenticated, month]);

  return (
    <div>
      <Navbar month={month} onChangeMonth={setMonth} />
      <ExpenseList data={expenses} />
    </div>
  ); 
}