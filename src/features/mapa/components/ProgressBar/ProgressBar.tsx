import styles from './ProgressBar.module.scss';

interface Props {
  pct: number;
}

export function ProgressBar({ pct }: Props) {
  return (
    <div
      className={styles.progress}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <div className={styles.progressFill} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default ProgressBar;
