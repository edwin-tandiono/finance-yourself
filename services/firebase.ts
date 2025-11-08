
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

import type { OAuthCredential } from 'firebase/auth';

const CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const TOKEN_KEY = 'token';

const app = initializeApp(CONFIG);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export const listenOnAuthStateChanged = ({
  onLoggedIn,
  onLoggedOut,
} : {
  onLoggedIn: () => void,
  onLoggedOut: () => void,
}): void => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      onLoggedIn();
    } else {
      onLoggedOut();
    }
  });
};

export const signIn = (): Promise<OAuthCredential | null> => {
  return signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (credential?.accessToken) {
        localStorage.setItem(TOKEN_KEY, credential?.accessToken);
      }

      return credential;
    });
};

export const getExpenses = async () => {
  const expensesCol = collection(db, 'expenses');
  const expenseSnapshot = await getDocs(expensesCol);
  const expenseList = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  console.log('Your expenses:', expenseList);
  return expenseList;
};
