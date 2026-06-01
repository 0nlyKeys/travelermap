'use client';

import { useState, useEffect, type KeyboardEvent } from 'react';
import type { PuntoInteres } from '@features/mapa/types/ruta';
import styles from './PuntosInteresPanel.module.scss';

interface Props {
  puntosInteres: PuntoInteres[];
  placingPOI: boolean;
  pendingPoiLatLng: { lat: number; lng: number } | null;
  onAdd: (nombre: string, lat: number, lng: number) => void;
  onRemove: (id: string) => void;
  onFlyTo: (lat: number, lng: number) => void;
  onStartPlacing: () => void;
  onCancelPlacing: () => void;
  onClearPending: () => void;
}

export function PuntosInteresPanel({
  puntosInteres,
  placingPOI,
  pendingPoiLatLng,
  onAdd,
  onRemove,
  onFlyTo,
  onStartPlacing,
  onCancelPlacing,
  onClearPending,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  useEffect(() => {
    if (!pendingPoiLatLng) return;
    setLat(pendingPoiLatLng.lat.toFixed(5));
    setLng(pendingPoiLatLng.lng.toFixed(5));
    setShowForm(true);
    onClearPending();
  }, [pendingPoiLatLng, onClearPending]);

  const submit = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!nombre.trim()) { alert('Ingresa un nombre'); return; }
    if (isNaN(latNum) || isNaN(lngNum)) { alert('Ingresa coordenadas válidas'); return; }
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      alert('Coordenadas fuera de rango');
      return;
    }
    onAdd(nombre.trim(), latNum, lngNum);
    setNombre('');
    setLat('');
    setLng('');
    setShowForm(false);
  };

  const cancel = () => {
    setShowForm(false);
    setNombre('');
    setLat('');
    setLng('');
    if (placingPOI) onCancelPlacing();
  };

  const onEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <aside className={styles.panel}>
      <header className={styles.panelHeader}>
        <div className={styles.panelTitle}>Puntos de interés</div>
        <div className={styles.panelCount}>{puntosInteres.length}</div>
      </header>

      <div className={styles.pillsArea}>
        {puntosInteres.length === 0 && (
          <span className={styles.empty}>Sin puntos agregados</span>
        )}
        {puntosInteres.map((poi) => (
          <div
            key={poi.id}
            className={styles.pill}
            onClick={() => onFlyTo(poi.lat, poi.lng)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onFlyTo(poi.lat, poi.lng); }}
          >
            <span className={styles.pillDot} />
            <span className={styles.pillName}>{poi.nombre}</span>
            <button
              type="button"
              className={styles.pillDelete}
              onClick={(e) => { e.stopPropagation(); onRemove(poi.id); }}
              title="Eliminar"
              aria-label={`Eliminar ${poi.nombre}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className={styles.addFooter}>
        {showForm ? (
          <div className={styles.formArea}>
            <input
              className={styles.input}
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del punto"
              onKeyDown={onEnter}
              autoFocus
            />
            <div className={styles.coordRow}>
              <input
                className={styles.input}
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="Latitud"
                inputMode="decimal"
                onKeyDown={onEnter}
              />
              <input
                className={styles.input}
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="Longitud"
                inputMode="decimal"
                onKeyDown={onEnter}
              />
            </div>
            <button type="button" className={styles.submitBtn} onClick={submit}>
              + AÑADIR PUNTO
            </button>
            <button type="button" className={styles.cancelLink} onClick={cancel}>
              cancelar
            </button>
          </div>
        ) : placingPOI ? (
          <div className={styles.placingState}>
            <div className={styles.placingHint}>Haz click en el mapa...</div>
            <button type="button" className={styles.cancelLink} onClick={onCancelPlacing}>
              cancelar
            </button>
          </div>
        ) : (
          <div className={styles.addBtns}>
            <button
              type="button"
              className={styles.btnMap}
              onClick={() => { setShowForm(true); onStartPlacing(); }}
            >
              ◆ Colocar en mapa
            </button>
            <button
              type="button"
              className={styles.btnManual}
              onClick={() => setShowForm(true)}
            >
              + Coordenadas
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default PuntosInteresPanel;
