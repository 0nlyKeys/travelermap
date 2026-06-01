import type { Parada } from '@features/mapa/types/ruta';
import { StopsList } from './StopsList';
import { AddStopForm } from './AddStopForm';
import styles from './StopsPanel.module.scss';

interface Props {
  paradas: Parada[];
  editMode: boolean;
  activeStopIdx: number;
  passedStops: Set<number>;
  hidden?: boolean;
  placingStop: boolean;
  pendingStopLatLng: { lat: number; lng: number } | null;
  poiPanelOpen?: boolean;
  onUpdateName: (idx: number, name: string) => void;
  onDeleteStop: (idx: number) => void;
  onAddStop: (name: string, lat: number, lng: number) => void;
  onStartPlacingStop: () => void;
  onCancelPlacingStop: () => void;
  onClearPendingStop: () => void;
  onTogglePOIPanel?: () => void;
  onFlyTo?: (idx: number) => void;
}

export function StopsPanel({
  paradas,
  editMode,
  activeStopIdx,
  passedStops,
  hidden,
  placingStop,
  pendingStopLatLng,
  poiPanelOpen,
  onUpdateName,
  onDeleteStop,
  onAddStop,
  onStartPlacingStop,
  onCancelPlacingStop,
  onClearPendingStop,
  onTogglePOIPanel,
  onFlyTo,
}: Props) {
  const cls = [
    styles.sidePanel,
    hidden ? styles.hidden : '',
    editMode ? styles.editMode : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={cls}>
      <header className={styles.panelHeader}>
        <div className={styles.panelTitle}>Paradas</div>
        <div className={styles.panelCount}>{paradas.length}</div>
      </header>
      <StopsList
        paradas={paradas}
        editMode={editMode}
        activeStopIdx={activeStopIdx}
        passedStops={passedStops}
        onUpdateName={onUpdateName}
        onDelete={onDeleteStop}
        onFlyTo={onFlyTo}
      />
      {editMode && (
        <AddStopForm
          placingStop={placingStop}
          pendingStopLatLng={pendingStopLatLng}
          onAdd={onAddStop}
          onStartPlacing={onStartPlacingStop}
          onCancelPlacing={onCancelPlacingStop}
          onClearPending={onClearPendingStop}
        />
      )}
      {editMode && onTogglePOIPanel && (
        <button
          type="button"
          className={[styles.poiTab, poiPanelOpen ? styles.poiTabActive : ''].filter(Boolean).join(' ')}
          onClick={onTogglePOIPanel}
          title="Puntos de interés"
          aria-label="Abrir panel de puntos de interés"
        >
          ◆
        </button>
      )}
    </aside>
  );
}

export default StopsPanel;
