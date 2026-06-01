import styles from './LoadingOverlay.module.scss';

interface Props {
  show: boolean;
  text?: string;
}

export function LoadingOverlay({ show, text = 'Calculando ruta' }: Props) {
  if (!show) return null;
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <div className={styles.loadingText}>{text}</div>
      <div className={styles.loadingBar} />
    </div>
  );
}

export default LoadingOverlay;
