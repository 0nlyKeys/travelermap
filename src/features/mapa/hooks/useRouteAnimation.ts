import { useCallback, useEffect, useRef, useState } from 'react';
import type * as LeafletType from 'leaflet';
import type { Parada, LatLng } from '@features/mapa/types/ruta';
import {
  positionAt,
  findNearestStop,
  computePassedStops,
} from '@features/mapa/lib/distance';
import { useSyncedRef } from './useSyncedRef';
import type { RouteBuilderHandle } from './useRouteBuilder';

interface Opts {
  L: typeof LeafletType | null;
  map: LeafletType.Map | null;
  paradas: Parada[];
  builder: RouteBuilderHandle;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  speed: number;
  followCamLevel: 0 | 1 | 2;
  editMode: boolean;
}

export interface AnimationHandle {
  distanceKm: string;
  progressPct: number;
  activeStopIdx: number;
  passedStops: Set<number>;
  overlay: {
    name: string;
    isStart: boolean;
    show: boolean;
  };
  /** Read by orchestrator to decide whether to show the "press PLAY" hint. */
  isAtStart: boolean;
  togglePlay: () => void;
  reset: () => void;
  recenter: () => void;
  flyToClose: () => void;
  flyToOverview: () => void;
  flyToStop: (idx: number) => void;
}

/** ms it takes to traverse the full route at speed = 1 */
const FULL_TRAVERSAL_MS = 45000;
const OVERLAY_TRIGGER_DIST_M = 2500;
const OVERLAY_RESET_DIST_M = 8000;
const ACTIVE_STOP_DIST_M = 5000;
const OVERLAY_DURATION_MS = 2500;

/**
 * Owns the requestAnimationFrame loop. Reads route refs populated by
 * useRouteBuilder, mutates moto / polyline positions directly, surfaces
 * progress / nearest stop / overlay state as React state.
 */
export function useRouteAnimation({
  L,
  map,
  paradas,
  builder,
  isPlaying,
  setIsPlaying,
  speed,
  followCamLevel,
  editMode,
}: Opts): AnimationHandle {
  const [distanceKm, setDistanceKm] = useState('0');
  const [progressPct, setProgressPct] = useState(0);
  const [activeStopIdx, setActiveStopIdx] = useState(-1);
  const [passedStops, setPassedStops] = useState<Set<number>>(new Set());
  const [overlayName, setOverlayName] = useState('');
  const [overlayShow, setOverlayShow] = useState(false);
  const [overlayIsStart, setOverlayIsStart] = useState(false);

  const progressRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const lastStopShownRef = useRef(-1);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isZoomingRef = useRef(false);

  const isPlayingRef = useSyncedRef(isPlaying);
  const speedRef = useSyncedRef(speed);
  const followCamRef = useSyncedRef(followCamLevel);
  const editModeRef = useSyncedRef(editMode);
  const paradasRef = useSyncedRef(paradas);

  const {
    routeRef,
    distancesRef,
    totalRef,
    motoMarkerRef,
    traveledLineRef,
    glowLineRef,
    version: routeVersion,
  } = builder;

  // Reset whenever route is rebuilt
  useEffect(() => {
    progressRef.current = 0;
    lastStopShownRef.current = -1;
    setIsPlaying(false);
    setProgressPct(0);
    setDistanceKm('0');
    setActiveStopIdx(-1);
    setPassedStops(new Set());
    setOverlayShow(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeVersion]);


  const showStartOverlay = useCallback((name: string, isStart: boolean) => {
    setOverlayIsStart(isStart);
    setOverlayName(name);
    setOverlayShow(true);
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = setTimeout(
      () => setOverlayShow(false),
      OVERLAY_DURATION_MS
    );
  }, []);

  // Single render step — pure of React state except for setX calls.
  const renderStep = useCallback(() => {
    if (!map || routeRef.current.length === 0 || !motoMarkerRef.current) return;

    const route = routeRef.current;
    const distances = distancesRef.current;
    const total = totalRef.current;
    const t = progressRef.current;
    const pos = positionAt(route, distances, total, t);
    motoMarkerRef.current.setLatLng(pos);

    const targetDist = t * total;
    const traveledCoords: LatLng[] = [];
    for (let i = 0; i < route.length; i++) {
      if (distances[i] <= targetDist) traveledCoords.push(route[i]);
      else break;
    }
    traveledCoords.push(pos);
    if (!isZoomingRef.current) {
      traveledLineRef.current?.setLatLngs(traveledCoords);
      glowLineRef.current?.setLatLngs(traveledCoords);
    }

    setDistanceKm((targetDist / 1000).toFixed(1));
    setProgressPct(t * 100);

    const distFn = (a: LatLng, b: LatLng) => map.distance(a, b);
    const paradas = paradasRef.current;
    const nearest = findNearestStop(paradas, pos, distFn);
    const passed = computePassedStops(paradas, route, distances, targetDist, distFn);

    setPassedStops(passed);
    setActiveStopIdx(nearest.distance < ACTIVE_STOP_DIST_M ? nearest.idx : -1);

    if (
      nearest.distance < OVERLAY_TRIGGER_DIST_M &&
      nearest.idx !== lastStopShownRef.current &&
      !editModeRef.current
    ) {
      showStartOverlay(paradas[nearest.idx].nombre.toUpperCase(), nearest.idx === 0);
      lastStopShownRef.current = nearest.idx;
    }
    if (nearest.distance > OVERLAY_RESET_DIST_M && lastStopShownRef.current !== -1) {
      lastStopShownRef.current = -1;
    }

    if (followCamRef.current === 1 && isPlayingRef.current) {
      map.panTo(pos, { animate: true, duration: 0.3, easeLinearity: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, showStartOverlay]);

  // rAF loop — installed once when map ready
  useEffect(() => {
    if (!L || !map) return;
    const loop = (time: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (isPlayingRef.current && routeRef.current.length > 1) {
        progressRef.current += (dt / FULL_TRAVERSAL_MS) * speedRef.current;
        if (progressRef.current >= 1) {
          progressRef.current = 1;
          setIsPlaying(false);
        }
        renderStep();
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L, map, renderStep]);

  const togglePlay = useCallback(() => {
    if (routeRef.current.length < 2) return;
    if (progressRef.current >= 1) progressRef.current = 0;
    const startingFromZero = progressRef.current === 0;
    if (!isPlayingRef.current) {
      if (startingFromZero && paradasRef.current.length > 0) {
        showStartOverlay(paradasRef.current[0].nombre.toUpperCase(), true);
        lastStopShownRef.current = 0;
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showStartOverlay]);

  const reset = useCallback(() => {
    progressRef.current = 0;
    setIsPlaying(false);
    lastStopShownRef.current = -1;
    setOverlayShow(false);
    renderStep();
    if (map && L && routeRef.current.length > 0) {
      map.fitBounds(L.latLngBounds(routeRef.current), {
        padding: [100, 100],
        animate: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderStep, L, map]);

  const recenter = useCallback(() => {
    if (map && L && routeRef.current.length > 0) {
      map.fitBounds(L.latLngBounds(routeRef.current), {
        padding: [100, 100],
        animate: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L, map]);

  const flyToClose = useCallback(() => {
    if (!map || routeRef.current.length === 0) return;
    const pos = positionAt(
      routeRef.current,
      distancesRef.current,
      totalRef.current,
      progressRef.current
    );
    map.flyTo(pos, 13, { duration: 1.4, easeLinearity: 0.2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  const flyToStop = useCallback((idx: number) => {
    if (!map) return;
    const parada = paradasRef.current[idx];
    if (!parada) return;
    map.flyTo([parada.lat, parada.lng], 14, { duration: 1.0, easeLinearity: 0.2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  const flyToOverview = useCallback(() => {
    if (!L || !map || routeRef.current.length === 0) return;
    const bounds = L.latLngBounds(routeRef.current);
    isZoomingRef.current = true;
    map.once('moveend', () => { isZoomingRef.current = false; });
    map.flyToBounds(bounds, { padding: [60, 60], duration: 1.6, easeLinearity: 0.2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L, map]);

  return {
    distanceKm,
    progressPct,
    activeStopIdx,
    passedStops,
    overlay: { name: overlayName, isStart: overlayIsStart, show: overlayShow },
    isAtStart: progressRef.current === 0,
    togglePlay,
    reset,
    recenter,
    flyToClose,
    flyToOverview,
    flyToStop,
  };
}
