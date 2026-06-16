import { useEffect, useState } from 'react';

import styles from 'components/common/loader/Loader.module.scss';
import Logo from 'components/common/logo';

export default function Loader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const showAppLoader = () => setShow(true);
    const hideAppLoader = () => setShow(false);
 
    window.addEventListener('showAppLoader', showAppLoader);
    window.addEventListener('hideAppLoader', hideAppLoader);

    return () => {
      window.removeEventListener('showAppLoader', showAppLoader);
      window.removeEventListener('hideAppLoader', hideAppLoader);
    };
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div className={styles['loader']}>
      <Logo animated/>
    </div>
  );
};
