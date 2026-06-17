import { useState } from 'react';
import { useNavigate } from 'react-router';

import ErrorMessage from 'components/common/error-message';
import Logo from 'components/common/logo';
import styles from 'components/pages/login/LoginPage.module.scss';
import { signIn } from 'services/firebase';
import { signInAsGuest } from 'services/guest';
import { hideAppLoader, showAppLoader } from 'utils/loader';

export default function LoginPage() {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = () => {
    setErrorMessage('');
    showAppLoader();

    signIn()
      .then(() => {
        navigate('/', { replace: true });
      })
      .catch((error: unknown) => {
        hideAppLoader();

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(String(error));
        }
      });
  };

  const handleSignInAsGuest = () => {
    signInAsGuest();
    navigate('/', { replace: true });
  };

  return (
    <center className={styles['login']}>
      <Logo />
      <div>
        <h1>
          finance
          <span />
          <br />
          yourself
        </h1>
        <p>
          This is a personal project to track my monthly expenses.
          <br />
          <br />
          It is not intended for public use,
          <br />
          but you can try it as a guest with non persistent storage.
        </p>
      </div>
      <ErrorMessage>{errorMessage}</ErrorMessage>
      <div>
        <button onClick={handleSignIn} type="button">Sign in with Google</button>
        <br />
        <button onClick={handleSignInAsGuest} type="button">Try as guest</button>
      </div>

      <a href="https://github.com/edwin-tandiono/finance-yourself">
        <img alt="github" src="https://cdn.simpleicons.org/github" />
      </a>
    </center>
  );
};
