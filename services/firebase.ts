
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  getFirestore,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
  where,
} from 'firebase/firestore';

import {
  validateMonth,
  validateYear,
} from 'utils/date';

import type { OAuthCredential } from 'firebase/auth';
import type { Expense } from 'types/models/expense';

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

export const getExpenses = async (date: Date = new Date()): Promise<Expense[]> => {
  const expensesCol = collection(db, 'expenses');

  const month = validateMonth(date.getMonth() + 1);
  const year = validateYear(date.getFullYear());

  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const q = query(
    expensesCol,
    where('date', '>=', start),
    where('date', '<=', end),
    orderBy('date', 'desc'),
  );
  const expenseSnapshot = await getDocs(q);

  const expenseList: Expense[] = expenseSnapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      amount: data.amount || 0,
      category: data.category || '',
      date: data.date ? new Date(data.date.seconds * 1000) : undefined,
      description: data.description || '',
    } as Expense;
  });

  return expenseList;
};

export const createExpense = async (expense: Omit<Expense, 'id'>): Promise<string> => {
  const expensesCol = collection(db, 'expenses');
  const docRef = await addDoc(expensesCol, expense);

  return docRef.id;
};

export const updateExpense = async (id: string, expense: Omit<Expense, 'id'>): Promise<void> => {
  const expenseDoc = doc(db, 'expenses', id);

  await updateDoc(expenseDoc, expense);
};
