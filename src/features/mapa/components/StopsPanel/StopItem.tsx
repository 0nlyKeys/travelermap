import type { Parada } from '@features/mapa/types/ruta';
import styles from './StopsPanel.module.scss';

interface Props {
  stop: Parada;
  index: number;
  editMode: boolean;
  isActive: boolean;
  isPassed: boolean;
  onUpdateName: (idx: number, name: string) => void;
  onDelete: (idx: number) => void;
  onFlyTo?: (idx: number) => void;
}

export function StopItem({
  stop,
  index,
  editMode,
  isActive,
  isPassed,
  onUpdateName,
  onDelete,
  onFlyTo,
}: Props) {
  const cls = [
    styles.stopItem,
    isActive ? styles.activeStop : '',
    isPassed && !isActive ? styles.passedStop : '',
    editMode ? styles.editMode : '',
    !editMode && onFlyTo ? styles.clickable : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cls}
      onClick={!editMode && onFlyTo ? () => onFlyTo(index) : undefined}
      role={!editMode && onFlyTo ? 'button' : undefined}
      tabIndex={!editMode && onFlyTo ? 0 : undefined}
      onKeyDown={!editMode && onFlyTo ? (e) => { if (e.key === 'Enter') onFlyTo(index); } : undefined}
    >
      <div className={styles.stopMarker} />
      <div className={styles.stopInfo}>
        {editMode ? (
          <input
            className={styles.stopNameInput}
            value={stop.nombre}
            onChange={(e) => onUpdateName(index, e.target.value)}
            placeholder="Sin nombre"
          />
        ) : (
          <div className={styles.stopName}>
            {index + 1}. {stop.nombre}
          </div>
        )}
        <div className={styles.stopCoords}>
          {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
        </div>
      </div>
      {editMode && (
        <button
          type="button"
          className={styles.stopDelete}
          onClick={() => onDelete(index)}
          title="Eliminar"
          aria-label={`Eliminar parada ${stop.nombre}`}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default StopItem;
