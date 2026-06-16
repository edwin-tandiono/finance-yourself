import styles from 'components/common/logo/Logo.module.scss';

export default function Logo({
  animated = false,
}: {
  animated?: boolean,
}) {
  return (
    <div className={`${styles['logo']} ${
      animated ? styles['logo--animated'] : ''
    }`}>
      <div />
      <div />
      <div />
      <div />
    </div>
  );
}
