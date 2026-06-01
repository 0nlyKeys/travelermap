import { create } from 'zustand';
import type { Parada, PuntoInteres } from '@features/mapa/types/ruta';

/**
 * Global store for the active map view: stops + playback flags + UI mode.
 *
 * NOTE: this is module-scoped, so it survives client-side navigation between
 * `/rutas/[slug]` pages. The orchestrator calls `loadRoute(paradas)` on mount
 * to reset state per route.
 *
 * Convention: leaf presentational components stay prop-driven (testable in
 * isolation). Only the orchestrator subscribes via selectors and passes data
 * down. The store is mutated through actions only — no setState from outside.
 */
export interface MapaState {
  // ─── Data ─────────────────────────────────────────────────
  paradas: Parada[];
  puntosInteres: PuntoInteres[];

  // ─── Map-click placing mode ───────────────────────────────
  placingStop: boolean;
  pendingStopLatLng: { lat: number; lng: number } | null;
  placingPOI: boolean;
  pendingPoiLatLng: { lat: number; lng: number } | null;

  // ─── Playback ────────────────────────────────────────────
  isPlaying: boolean;
  speed: number;
  followCamLevel: 0 | 1 | 2;

  // ─── UI mode ─────────────────────────────────────────────
  editMode: boolean;
  hideUi: boolean;
  lightMap: boolean;

  // ─── Actions ─────────────────────────────────────────────
  loadRoute: (paradas: Parada[]) => void;
  loadPuntosInteres: (pois: PuntoInteres[]) => void;

  addStop: (nombre: string, lat: number, lng: number) => void;
  removeStop: (idx: number) => void;
  updateStopName: (idx: number, nombre: string) => void;
  setPlacingStop: (v: boolean) => void;
  setPendingStopLatLng: (ll: { lat: number; lng: number } | null) => void;

  setIsPlaying: (v: boolean) => void;
  setSpeed: (v: number) => void;
  toggleFollow: () => void;

  addPuntoInteres: (nombre: string, lat: number, lng: number) => void;
  removePuntoInteres: (id: string) => void;
  setPlacingPOI: (v: boolean) => void;
  setPendingPoiLatLng: (ll: { lat: number; lng: number } | null) => void;

  toggleEdit: () => void;
  toggleHideUi: () => void;
  toggleLightMap: () => void;
}

const MIN_STOPS = 2;

export const useMapaStore = create<MapaState>((set, get) => ({
  paradas: [],
  puntosInteres: [],
  placingStop: false,
  pendingStopLatLng: null,
  placingPOI: false,
  pendingPoiLatLng: null,
  isPlaying: false,
  speed: 1,
  followCamLevel: 0,
  editMode: false,
  hideUi: false,
  lightMap: false,

  loadRoute: (paradas) =>
    set({
      paradas,
      puntosInteres: [],
      placingStop: false,
      pendingStopLatLng: null,
      placingPOI: false,
      pendingPoiLatLng: null,
      isPlaying: false,
      speed: 1,
      followCamLevel: 0,
      editMode: false,
      hideUi: false,
      lightMap: false,
    }),

  loadPuntosInteres: (pois) => set({ puntosInteres: pois }),

  addStop: (nombre, lat, lng) =>
    set((s) => ({
      paradas: [
        ...s.paradas,
        { nombre: nombre || `Parada ${s.paradas.length + 1}`, lat, lng },
      ],
    })),

  removeStop: (idx) => {
    const { paradas } = get();
    if (paradas.length <= MIN_STOPS) {
      alert(`Necesitas al menos ${MIN_STOPS} paradas`);
      return;
    }
    set({ paradas: paradas.filter((_, i) => i !== idx) });
  },

  updateStopName: (idx, nombre) =>
    set((s) => ({
      paradas: s.paradas.map((p, i) =>
        i === idx ? { ...p, nombre: nombre || 'Sin nombre' } : p
      ),
    })),

  setPlacingStop: (placingStop) => set({ placingStop }),
  setPendingStopLatLng: (pendingStopLatLng) => set({ pendingStopLatLng }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSpeed: (speed) => set({ speed }),
  toggleFollow: () =>
    set((s) => ({ followCamLevel: (((s.followCamLevel + 1) % 3) as 0 | 1 | 2) })),

  addPuntoInteres: (nombre, lat, lng) =>
    set((s) => ({
      puntosInteres: [
        ...s.puntosInteres,
        { id: `poi-${Date.now()}-${Math.random().toString(36).slice(2)}`, nombre, lat, lng },
      ],
    })),

  removePuntoInteres: (id) =>
    set((s) => ({ puntosInteres: s.puntosInteres.filter((p) => p.id !== id) })),

  setPlacingPOI: (placingPOI) => set({ placingPOI }),
  setPendingPoiLatLng: (pendingPoiLatLng) => set({ pendingPoiLatLng }),

  toggleEdit: () =>
    set((s) => ({
      editMode: !s.editMode,
      placingStop: false,
      placingPOI: false,
    })),
  toggleHideUi: () => set((s) => ({ hideUi: !s.hideUi })),
  toggleLightMap: () => set((s) => ({ lightMap: !s.lightMap })),
}));
