import { useState } from 'react';
import { useNavigate } from 'react-router';

import ErrorMessage from 'components/common/error-message';
import styles from 'components/pages/login/LoginPage.module.scss';
import { signIn } from 'services/firebase';
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

  return (
    <div className={styles['login']}>
      <ErrorMessage>{errorMessage}</ErrorMessage>
      <button onClick={handleSignIn} type="button">Sign in with Google</button>
    </div>
  );
};
