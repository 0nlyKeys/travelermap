import styles from './PlaybackControls.module.scss';

interface Props {
  speed: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function SpeedSlider({
  speed,
  onChange,
  min = 0.25,
  max = 4,
  step = 0.25,
}: Props) {
  return (
    <div className={styles.speedControl}>
      <div className={styles.speedHeader}>
        <span className={styles.speedLabel}>Velocidad</span>
        <span className={styles.speedValue}>
          {speed.toFixed(2).replace(/\.?0+$/, '')}×
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={speed}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label="Velocidad de reproducción"
      />
    </div>
  );
}

export default SpeedSlider;
