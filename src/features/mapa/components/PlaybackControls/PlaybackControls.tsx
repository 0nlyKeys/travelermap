import { Icon } from '@shared/components/Icon';
import { SpeedSlider } from './SpeedSlider';
import styles from './PlaybackControls.module.scss';

const CAM_TITLES = [
  'Cámara sigue marcador (F)',
  'Vista de ruta (F)',
  'Desactivar cámara (F)',
] as const;

const CAM_LABELS = ['', 'SEGUIR', 'RUTA'] as const;

interface Props {
  isPlaying: boolean;
  followCamLevel: 0 | 1 | 2;
  speed: number;
  hidden?: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onToggleFollow: () => void;
  onSpeedChange: (value: number) => void;
}

export function PlaybackControls({
  isPlaying,
  followCamLevel,
  speed,
  hidden,
  onTogglePlay,
  onReset,
  onToggleFollow,
  onSpeedChange,
}: Props) {
  const nextLevel = ((followCamLevel + 1) % 3) as 0 | 1 | 2;

  return (
    <div
      className={`${styles.controls} ${hidden ? styles.hidden : ''} ${isPlaying ? styles.playing : ''}`}
    >
      <button
        type="button"
        className={styles.btn}
        onClick={onReset}
        title="Reiniciar (R)"
        aria-label="Reiniciar recorrido"
      >
        <Icon name="reset" />
      </button>

      <button
        type="button"
        className={`${styles.btn} ${styles.btnPrimary}`}
        onClick={onTogglePlay}
        title="Play/Pausa (Espacio)"
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        <Icon name={isPlaying ? 'pause' : 'play'} size={20} />
      </button>

      <div className={styles.followWrap}>
        <button
          type="button"
          className={`${styles.btn} ${followCamLevel > 0 ? styles.active : ''}`}
          onClick={onToggleFollow}
          title={CAM_TITLES[nextLevel]}
          aria-pressed={followCamLevel > 0}
          aria-label={`Cámara: ${followCamLevel === 0 ? 'desactivada' : CAM_LABELS[followCamLevel]}`}
        >
          <Icon name="target" />
        </button>
        {followCamLevel > 0 && (
          <span
            className={`${styles.camBadge} ${followCamLevel === 2 ? styles.camBadgeRuta : ''}`}
          >
            {CAM_LABELS[followCamLevel]}
          </span>
        )}
      </div>

      <div className={styles.divider} />

      <SpeedSlider speed={speed} onChange={onSpeedChange} />
    </div>
  );
}

export default PlaybackControls;
