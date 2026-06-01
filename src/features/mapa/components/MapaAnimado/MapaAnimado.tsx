'use client';

/**
 * MapaAnimado — orchestrator.
 *
 * Subscribes to useMapaStore via slice-selectors (one selector per concern
 * → minimal re-renders) and threads the values into the geometry/animation
 * hooks. Leaf UI components remain prop-driven.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Ruta } from '@features/mapa/types/ruta';
import { useMapaStore } from '@features/mapa/store/useMapaStore';
import { useLeafletMap } from '@features/mapa/hooks/useLeafletMap';
import { useRouteBuilder } from '@features/mapa/hooks/useRouteBuilder';
import { useRouteAnimation } from '@features/mapa/hooks/useRouteAnimation';
import { useKeyboardShortcuts } from '@features/mapa/hooks/useKeyboardShortcuts';
import { MapaHeader } from '@features/mapa/components/MapaHeader';
import { ActionButtons } from '@features/mapa/components/ActionButtons';
import { EditBanner } from '@features/mapa/components/EditBanner';
import { StopsPanel } from '@features/mapa/components/StopsPanel';
import { PuntosInteresPanel } from '@features/mapa/components/PuntosInteresPanel';
import { StopOverlay } from '@features/mapa/components/StopOverlay';
import { PlaybackControls } from '@features/mapa/components/PlaybackControls';
import { ProgressBar } from '@features/mapa/components/ProgressBar';
import { LoadingOverlay } from '@features/mapa/components/LoadingOverlay';
import styles from './MapaAnimado.module.scss';

interface Props {
  ruta: Ruta;
}

const INITIAL_CENTER: [number, number] = [4.85, -74.6];
const INITIAL_ZOOM = 9;

export default function MapaAnimado({ ruta }: Props) {
  // ─── Store slices (one selector each → granular re-renders) ──
  const paradas             = useMapaStore((s) => s.paradas);
  const puntosInteres       = useMapaStore((s) => s.puntosInteres);
  const placingStop         = useMapaStore((s) => s.placingStop);
  const pendingStopLatLng   = useMapaStore((s) => s.pendingStopLatLng);
  const placingPOI          = useMapaStore((s) => s.placingPOI);
  const pendingPoiLatLng    = useMapaStore((s) => s.pendingPoiLatLng);
  const isPlaying           = useMapaStore((s) => s.isPlaying);
  const speed               = useMapaStore((s) => s.speed);
  const followCamLevel      = useMapaStore((s) => s.followCamLevel);
  const editMode            = useMapaStore((s) => s.editMode);
  const hideUi              = useMapaStore((s) => s.hideUi);
  const lightMap            = useMapaStore((s) => s.lightMap);
  const loadRoute           = useMapaStore((s) => s.loadRoute);
  const loadPuntosInteres   = useMapaStore((s) => s.loadPuntosInteres);
  const removeStop          = useMapaStore((s) => s.removeStop);
  const updateStopName      = useMapaStore((s) => s.updateStopName);
  const addStop             = useMapaStore((s) => s.addStop);
  const setPlacingStop      = useMapaStore((s) => s.setPlacingStop);
  const setPendingStopLatLng = useMapaStore((s) => s.setPendingStopLatLng);
  const addPuntoInteres     = useMapaStore((s) => s.addPuntoInteres);
  const removePuntoInteres  = useMapaStore((s) => s.removePuntoInteres);
  const setPlacingPOI       = useMapaStore((s) => s.setPlacingPOI);
  const setPendingPoiLatLng = useMapaStore((s) => s.setPendingPoiLatLng);
  const setIsPlaying        = useMapaStore((s) => s.setIsPlaying);
  const setSpeed            = useMapaStore((s) => s.setSpeed);
  const toggleFollow        = useMapaStore((s) => s.toggleFollow);
  const toggleEdit          = useMapaStore((s) => s.toggleEdit);
  const toggleHideUi        = useMapaStore((s) => s.toggleHideUi);
  const toggleLightMap      = useMapaStore((s) => s.toggleLightMap);

  const [showPOIPanel, setShowPOIPanel] = useState(false);

  // ─── Hydrate store with this route's data ────────────────────
  useEffect(() => {
    loadRoute(ruta.paradas);
    loadPuntosInteres(ruta.puntosInteres ?? []);
  }, [ruta.paradas, ruta.puntosInteres, loadRoute, loadPuntosInteres]);

  useEffect(() => {
    if (!editMode) setShowPOIPanel(false);
  }, [editMode]);

  // ─── Leaflet + animation pipeline ────────────────────────────
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const onMapClick = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      const state = useMapaStore.getState();
      if (!state.editMode) return;
      if (state.placingPOI) {
        state.setPendingPoiLatLng({ lat, lng });
        state.setPlacingPOI(false);
        return;
      }
      if (state.placingStop) {
        state.setPendingStopLatLng({ lat, lng });
        state.setPlacingStop(false);
        return;
      }
    },
    []
  );

  const { L, map } = useLeafletMap({
    containerRef: mapContainerRef,
    initialCenter: INITIAL_CENTER,
    initialZoom: INITIAL_ZOOM,
    lightMap,
    onClick: onMapClick,
  });

  const flyToPOI = useCallback(
    (lat: number, lng: number) => {
      map?.flyTo([lat, lng], 14, { animate: true, duration: 0.8 });
    },
    [map]
  );

  const builder = useRouteBuilder({ L, map, paradas, puntosInteres, lightMap });

  const anim = useRouteAnimation({
    L,
    map,
    paradas,
    builder,
    isPlaying,
    setIsPlaying,
    speed,
    followCamLevel,
    editMode,
  });

  // ─── Follow-cam 3-state cycle: 0=off · 1=close · 2=overview ──
  const onToggleFollow = useCallback(() => {
    const next = ((useMapaStore.getState().followCamLevel + 1) % 3) as 0 | 1 | 2;
    toggleFollow();
    if (next === 1) anim.flyToClose();
    else if (next === 2) anim.flyToOverview();
  }, [toggleFollow, anim]);

  useKeyboardShortcuts({
    togglePlay: anim.togglePlay,
    reset: anim.reset,
    toggleHideUi,
    toggleFollow: onToggleFollow,
    toggleEdit,
    flyToStop: anim.flyToStop,
  });

  // ─── Render ──────────────────────────────────────────────────
  const showHint = !isPlaying && anim.isAtStart && !editMode && !hideUi;
  const rootClasses = [styles.root, editMode ? styles.editMode : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses} data-theme={lightMap ? 'light' : undefined}>
      <div ref={mapContainerRef} className={styles.map} />

      <LoadingOverlay show={builder.loading} />

      <MapaHeader
        titulo={ruta.titulo}
        subtitulo={ruta.subtitulo}
        distanceKm={anim.distanceKm}
        totalKm={builder.totalKm}
        hidden={hideUi}
      />

      <ActionButtons
        editMode={editMode}
        hideUi={hideUi}
        lightMap={lightMap}
        onToggleEdit={toggleEdit}
        onToggleHideUi={toggleHideUi}
        onToggleLightMap={toggleLightMap}
      />

      <EditBanner visible={editMode} />

      <StopsPanel
        paradas={paradas}
        editMode={editMode}
        activeStopIdx={anim.activeStopIdx}
        passedStops={anim.passedStops}
        hidden={hideUi}
        placingStop={placingStop}
        pendingStopLatLng={pendingStopLatLng}
        poiPanelOpen={showPOIPanel}
        onUpdateName={updateStopName}
        onDeleteStop={removeStop}
        onAddStop={addStop}
        onStartPlacingStop={() => setPlacingStop(true)}
        onCancelPlacingStop={() => setPlacingStop(false)}
        onClearPendingStop={() => setPendingStopLatLng(null)}
        onTogglePOIPanel={() => setShowPOIPanel((v) => !v)}
        onFlyTo={anim.flyToStop}
      />

      {editMode && showPOIPanel && (
        <PuntosInteresPanel
          puntosInteres={puntosInteres}
          placingPOI={placingPOI}
          pendingPoiLatLng={pendingPoiLatLng}
          onAdd={addPuntoInteres}
          onRemove={removePuntoInteres}
          onFlyTo={flyToPOI}
          onStartPlacing={() => setPlacingPOI(true)}
          onCancelPlacing={() => setPlacingPOI(false)}
          onClearPending={() => setPendingPoiLatLng(null)}
        />
      )}

      <StopOverlay
        show={anim.overlay.show}
        isStart={anim.overlay.isStart}
        name={anim.overlay.name}
      />

      {showHint && (
        <div className={styles.hint}>Presiona PLAY para iniciar el recorrido</div>
      )}

      <PlaybackControls
        isPlaying={isPlaying}
        followCamLevel={followCamLevel}
        speed={speed}
        hidden={hideUi}
        onTogglePlay={anim.togglePlay}
        onReset={anim.reset}
        onToggleFollow={onToggleFollow}
        onSpeedChange={setSpeed}
      />

      <ProgressBar pct={anim.progressPct} />
    </div>
  );
}
