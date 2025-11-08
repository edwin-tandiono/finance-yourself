import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  listenOnAuthStateChanged,
  getExpenses,
} from 'services/firebase';

export default function HomePage() {
  const navigate = useNavigate();

  const [authenticated, setAuthenticated] = useState(false);

  // On mount
  useEffect(() => {
    listenOnAuthStateChanged({
      onLoggedIn: () => setAuthenticated(true),
      onLoggedOut: () => navigate('/login', { replace: true }),
    });
  }, []);

  // On authenticated
  useEffect(() => {
    if (authenticated) {
      getExpenses();
    }
  }, [authenticated]);

  return <h1>Homepage</h1>; 
}