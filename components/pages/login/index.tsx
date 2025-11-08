import { useState } from 'react';
import { useNavigate } from 'react-router';

import ErrorMessage from 'components/common/error-message';
import { signIn } from 'services/firebase';

export default function LoginPage() {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = () => {
    setErrorMessage('');

    signIn()
      .then(() => {
        navigate('/', { replace: true });
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(String(error));
        }
      });
  };

  return (
    <div>
      <ErrorMessage>{errorMessage}</ErrorMessage>
      <button onClick={handleSignIn} type="button">Sign in</button>
    </div>
  );
};
