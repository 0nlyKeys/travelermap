import { Icon } from '@shared/components/Icon';
import styles from './ActionButtons.module.scss';

interface Props {
  editMode: boolean;
  hideUi: boolean;
  lightMap: boolean;
  onToggleEdit: () => void;
  onToggleHideUi: () => void;
  onToggleLightMap: () => void;
}

/**
 * Top-right floating buttons: edit toggle + UI visibility toggle.
 * The UI toggle stays partially visible when hideUi is on so the user can
 * bring everything back.
 */
export function ActionButtons({ editMode, hideUi, lightMap, onToggleEdit, onToggleHideUi, onToggleLightMap }: Props) {
  return (
    <div className={`${styles.topActions} ${hideUi ? styles.hidden : ''}`}>
      <button
        type="button"
        className={`${styles.actionBtn} ${editMode ? styles.active : ''}`}
        onClick={onToggleEdit}
        title="Editar paradas (E)"
        aria-pressed={editMode}
      >
        <Icon name="edit" />
      </button>
      <button
        type="button"
        className={`${styles.actionBtn} ${styles.toggleUiBtn} ${hideUi ? styles.dimmed : ''}`}
        onClick={onToggleHideUi}
        title="Ocultar UI (H)"
        aria-pressed={hideUi}
      >
        <Icon name="eye" />
      </button>
      <button
        type="button"
        className={`${styles.actionBtn} ${lightMap ? styles.active : ''}`}
        onClick={onToggleLightMap}
        title="Mapa claro"
        aria-pressed={lightMap}
      >
        <Icon name="sun" />
      </button>
    </div>
  );
}

export default ActionButtons;
