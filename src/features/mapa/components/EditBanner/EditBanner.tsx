import styles from './EditBanner.module.scss';

interface Props {
  visible: boolean;
}

export function EditBanner({ visible }: Props) {
  if (!visible) return null;
  return (
    <div className={styles.editBanner} role="status">
      Modo edición · Clic en el mapa para añadir paradas
    </div>
  );
}

export default EditBanner;
