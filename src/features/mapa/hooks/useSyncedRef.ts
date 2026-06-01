import { useEffect, useRef } from 'react';

/**
 * Returns a ref whose `.current` always tracks the latest value passed in.
 * Lets callbacks/effects read the freshest state without re-subscribing.
 *
 * Replaces the boilerplate of `const r = useRef(v); useEffect(() => { r.current = v }, [v])`.
 */
export function useSyncedRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
