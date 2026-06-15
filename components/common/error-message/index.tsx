import styles from 'components/common/error-message/ErrorMessage.module.scss';

export default function ErrorMessage({
  children = null,
}: { children?: React.ReactNode }) {
  if (!children) {
    return null;
  }

  return <div className={styles['error-message']}>{children}</div>;
}
