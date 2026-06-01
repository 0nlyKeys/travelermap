import { useState, useEffect, type KeyboardEvent } from 'react';
import styles from './StopsPanel.module.scss';

interface Props {
  placingStop: boolean;
  pendingStopLatLng: { lat: number; lng: number } | null;
  onAdd: (name: string, lat: number, lng: number) => void;
  onStartPlacing: () => void;
  onCancelPlacing: () => void;
  onClearPending: () => void;
}

export function AddStopForm({
  placingStop,
  pendingStopLatLng,
  onAdd,
  onStartPlacing,
  onCancelPlacing,
  onClearPending,
}: Props) {
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  useEffect(() => {
    if (!pendingStopLatLng) return;
    setLat(pendingStopLatLng.lat.toFixed(5));
    setLng(pendingStopLatLng.lng.toFixed(5));
    onClearPending();
  }, [pendingStopLatLng, onClearPending]);

  const submit = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      alert('Ingresa coordenadas válidas');
      return;
    }
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      alert('Coordenadas fuera de rango');
      return;
    }
    onAdd(name.trim(), latNum, lngNum);
    setName('');
    setLat('');
    setLng('');
  };

  const onEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div className={styles.editFooter}>
      {placingStop ? (
        <div className={styles.placingState}>
          <div className={styles.placingHint}>
            <span>Haz click en el mapa...</span>
          </div>
          <button type="button" className={styles.cancelPlacing} onClick={onCancelPlacing}>
            cancelar
          </button>
        </div>
      ) : (
        <button type="button" className={styles.placeOnMapBtn} onClick={onStartPlacing}>
          ◉ Colocar en mapa
        </button>
      )}

      <div className={styles.editHint}>
        <span>O añadir por coordenadas</span>
        <br />
        Lat, Lng (ej: 4.7110, -74.0721)
      </div>
      <div className={styles.coordInputs}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del lugar"
          onKeyDown={onEnter}
        />
      </div>
      <div className={styles.coordInputs}>
        <input
          type="text"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="Latitud"
          inputMode="decimal"
          onKeyDown={onEnter}
        />
        <input
          type="text"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          placeholder="Longitud"
          inputMode="decimal"
          onKeyDown={onEnter}
        />
      </div>
      <button type="button" className={styles.addStopBtn} onClick={submit}>
        + AÑADIR PARADA
      </button>
    </div>
  );
}

export default AddStopForm;
