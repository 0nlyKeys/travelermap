import styles from './StopOverlay.module.scss';

interface Props {
  show: boolean;
  isStart: boolean;
  name: string;
}

/**
 * Big centered label that fades in when the moto arrives at / starts from a stop.
 */
export function StopOverlay({ show, isStart, name }: Props) {
  return (
    <div
      className={`${styles.currentStop} ${show ? styles.show : ''}`}
      aria-hidden={!show}
    >
      <div className={styles.currentStopLabel}>
        {isStart ? 'Inicio de Ruta' : 'Llegando a'}
      </div>
      <div className={styles.currentStopName}>{name}</div>
    </div>
  );
}

export default StopOverlay;
