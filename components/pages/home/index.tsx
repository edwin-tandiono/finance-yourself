import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import Navbar from 'components/pages/home/navbar';
import {
  listenOnAuthStateChanged,
  getExpenses,
} from 'services/firebase';

export default function HomePage() {
  const navigate = useNavigate();

  const [authenticated, setAuthenticated] = useState(false);
  const [month, setMonth] = useState(new Date());

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
      getExpenses(month);
    }
  }, [authenticated, month]);

  return (
    <div>
      <Navbar month={month} onChangeMonth={setMonth} />
      <h1>Homepage</h1>
    </div>
  ); 
}