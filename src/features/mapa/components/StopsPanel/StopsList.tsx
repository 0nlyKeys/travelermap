import type { Parada } from '@features/mapa/types/ruta';
import { StopItem } from './StopItem';
import styles from './StopsPanel.module.scss';

interface Props {
  paradas: Parada[];
  editMode: boolean;
  activeStopIdx: number;
  passedStops: Set<number>;
  onUpdateName: (idx: number, name: string) => void;
  onDelete: (idx: number) => void;
  onFlyTo?: (idx: number) => void;
}

export function StopsList({
  paradas,
  editMode,
  activeStopIdx,
  passedStops,
  onUpdateName,
  onDelete,
  onFlyTo,
}: Props) {
  return (
    <div className={styles.stopsList}>
      {paradas.map((stop, i) => (
        <StopItem
          key={`${i}-${stop.nombre}`}
          stop={stop}
          index={i}
          editMode={editMode}
          isActive={activeStopIdx === i}
          isPassed={passedStops.has(i)}
          onUpdateName={onUpdateName}
          onDelete={onDelete}
          onFlyTo={onFlyTo}
        />
      ))}
    </div>
  );
}

export default StopsList;
