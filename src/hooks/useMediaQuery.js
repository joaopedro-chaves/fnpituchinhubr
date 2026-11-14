import { useCallback, useSyncExternalStore } from 'react';

/**
 * Observa uma media query CSS com fallback seguro quando `window.matchMedia` não existe.
 * @param {string} query
 * @param {boolean} [defaultMatches]
 * @returns {boolean}
 */
export function useMediaQuery(query, defaultMatches = false) {
    const subscribe = useCallback(
        onStoreChange => {
            if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
                return () => {};
            }
            const mql = window.matchMedia(query);
            if (typeof mql.addEventListener === 'function') {
                mql.addEventListener('change', onStoreChange);
                return () => mql.removeEventListener('change', onStoreChange);
            }
            mql.addListener(onStoreChange);
            return () => mql.removeListener(onStoreChange);
        },
        [query]
    );

    const getSnapshot = () => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return defaultMatches;
        }
        return window.matchMedia(query).matches;
    };

    return useSyncExternalStore(subscribe, getSnapshot, () => defaultMatches);
}
