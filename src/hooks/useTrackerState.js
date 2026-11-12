import { useState, useEffect, useMemo, useCallback, useRef, useDeferredValue } from 'react';
import { KEYS, STATUS_FILTERS, SORT_METHODS } from '../share-order.js';
import {
    getSpriteIdSet,
    uniqueValidIds,
    getActiveThemes,
    getReleasedSprites,
    getCollectionCounts,
    filterSprites,
    sortSprites,
} from '../query.js';

const EMPTY_COLLECTION = { obtained: [], mastered: [] };

function readStoredArray(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function persistValue(key, value) {
    try {
        localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    } catch (err) {
        console.warn('Unable to save tracker state.', err);
    }
}

function getShareCode() {
    return new URLSearchParams(window.location.search).get('c');
}

function getStoredCollection(sprites) {
    const validIds = getSpriteIdSet(sprites);
    const obtained = uniqueValidIds(readStoredArray(KEYS.obtained), validIds);
    const obtainedSet = new Set(obtained);
    const mastered = uniqueValidIds(readStoredArray(KEYS.mastered), validIds).filter(id =>
        obtainedSet.has(id)
    );
    return { obtained, mastered };
}

function getInitialFilters(sprites) {
    const themes = getActiveThemes(sprites);
    const storedTheme = localStorage.getItem(KEYS.theme) || 'all';
    const theme = themes.includes(storedTheme) ? storedTheme : 'all';

    let savedStatus = localStorage.getItem(KEYS.status) || 'all';
    if (savedStatus === 'obtained') savedStatus = 'owned';
    const status = STATUS_FILTERS.includes(savedStatus) ? savedStatus : 'all';

    return {
        search: localStorage.getItem(KEYS.search) || '',
        theme,
        season: localStorage.getItem(KEYS.season) || 'all',
        status,
    };
}

function getInitialSettings() {
    let savedSort = localStorage.getItem(KEYS.sortOrder);
    if (!savedSort) {
        const legacyGroup = localStorage.getItem('fn_state_group_theme');
        savedSort = legacyGroup === 'false' ? 'sprite' : 'theme';
    }
    const sortOrder = SORT_METHODS.includes(savedSort) ? savedSort : 'theme';

    return {
        hideMastered: localStorage.getItem(KEYS.hideMastered) === 'true',
        sortOrder,
        showUnreleased: localStorage.getItem(KEYS.showUnreleased) === 'true',
        lowFidelity: localStorage.getItem(KEYS.lowFidelity) === 'true',
        openExports: localStorage.getItem(KEYS.openExports) === 'true',
        lightTheme: localStorage.getItem(KEYS.lightTheme) === 'true',
    };
}

/**
 * Estado do rastreador.
 *
 * - `collection` guarda obtained + mastered em um único estado, assim
 *   "remover da coleção" atualiza os dois de forma atômica e pura
 *   (sem chamar setState dentro de outro setState).
 * - Toda gravação no localStorage acontece em `useEffect`, nunca dentro
 *   dos atualizadores, que precisam ser funções puras.
 */
export function useTrackerState(sprites) {
    // Lido uma única vez: se a URL tem ?c=..., já nasce em modo somente leitura
    // com coleção vazia, evitando "piscar" a coleção local antes da compartilhada.
    const [initial] = useState(() => {
        const shareCode = getShareCode();
        return {
            shareCode,
            collection: shareCode ? EMPTY_COLLECTION : getStoredCollection(sprites),
            filters: getInitialFilters(sprites),
            settings: getInitialSettings(),
        };
    });

    const [viewMode, setViewMode] = useState(Boolean(initial.shareCode));
    const [loadingShared, setLoadingShared] = useState(Boolean(initial.shareCode));
    const [collection, setCollection] = useState(initial.collection);
    const [filters, setFilters] = useState(initial.filters);
    const [settings, setSettings] = useState(initial.settings);

    const { obtained, mastered } = collection;
    const deferredSearch = useDeferredValue(filters.search);

    const persistedCollectionRef = useRef(initial.collection);
    const persistedFiltersRef = useRef({
        theme: initial.filters.theme,
        season: initial.filters.season,
        status: initial.filters.status,
    });
    const persistedSettingsRef = useRef(initial.settings);
    const persistedSearchRef = useRef(initial.filters.search);
    const pendingSearchRef = useRef(initial.filters.search);
    const hasPendingSearchRef = useRef(false);
    const searchDebounceRef = useRef(null);

    const flushPendingSearch = useCallback(() => {
        if (searchDebounceRef.current !== null) {
            clearTimeout(searchDebounceRef.current);
            searchDebounceRef.current = null;
        }
        if (!hasPendingSearchRef.current) return;
        hasPendingSearchRef.current = false;
        const nextSearch = pendingSearchRef.current;
        if (persistedSearchRef.current !== nextSearch) {
            persistedSearchRef.current = nextSearch;
            persistValue(KEYS.search, nextSearch);
        }
    }, []);

    // Decodifica a coleção compartilhada (?c=...) enquanto estiver em modo somente leitura
    useEffect(() => {
        if (!viewMode || !initial.shareCode) return;

        let cancelled = false;
        import('../share-codec.js')
            .then(({ decompressCollection }) => decompressCollection(sprites, initial.shareCode))
            .then(decoded => {
                if (cancelled) return;
                setCollection(decoded);
                setLoadingShared(false);
            })
            .catch(err => {
                if (cancelled) return;
                console.warn('Unable to decode shared collection.', err);
                setLoadingShared(false);
            });

        return () => {
            cancelled = true;
        };
    }, [viewMode, initial.shareCode, sprites]);

    // Persistência incremental: coleção (nunca sobrescreve a coleção local em modo compartilhado)
    useEffect(() => {
        if (viewMode) return;
        const prev = persistedCollectionRef.current;
        if (prev.obtained !== collection.obtained) {
            persistValue(KEYS.obtained, collection.obtained);
        }
        if (prev.mastered !== collection.mastered) {
            persistValue(KEYS.mastered, collection.mastered);
        }
        persistedCollectionRef.current = collection;
    }, [collection, viewMode]);

    // Persistência incremental: filtros imediatos (theme, season, status)
    useEffect(() => {
        const prev = persistedFiltersRef.current;
        if (prev.theme !== filters.theme) persistValue(KEYS.theme, filters.theme);
        if (prev.season !== filters.season) persistValue(KEYS.season, filters.season);
        if (prev.status !== filters.status) persistValue(KEYS.status, filters.status);
        persistedFiltersRef.current = {
            theme: filters.theme,
            season: filters.season,
            status: filters.status,
        };
    }, [filters.theme, filters.season, filters.status]);

    // Persistência da busca com debounce de ~200 ms e flush garantido em saída/ocultamento
    useEffect(() => {
        pendingSearchRef.current = filters.search;
        if (persistedSearchRef.current === filters.search) {
            if (searchDebounceRef.current !== null) {
                clearTimeout(searchDebounceRef.current);
                searchDebounceRef.current = null;
            }
            hasPendingSearchRef.current = false;
            return;
        }

        hasPendingSearchRef.current = true;
        if (searchDebounceRef.current !== null) {
            clearTimeout(searchDebounceRef.current);
        }
        searchDebounceRef.current = setTimeout(flushPendingSearch, 200);
    }, [filters.search, flushPendingSearch]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                flushPendingSearch();
            }
        };
        window.addEventListener('pagehide', flushPendingSearch);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.removeEventListener('pagehide', flushPendingSearch);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            flushPendingSearch();
        };
    }, [flushPendingSearch]);

    // Persistência incremental: configurações
    useEffect(() => {
        const prev = persistedSettingsRef.current;
        for (const [key, value] of Object.entries(settings)) {
            if (prev[key] !== value) {
                persistValue(KEYS[key], value);
            }
        }
        persistedSettingsRef.current = settings;
    }, [settings]);

    // Classe global de baixo desempenho no body
    useEffect(() => {
        document.body.classList.toggle('low-fidelity', settings.lowFidelity);
        return () => document.body.classList.remove('low-fidelity');
    }, [settings.lowFidelity]);

    // Tema claro/escuro na raiz do documento (escuro por padrão)
    useEffect(() => {
        const root = document.documentElement;
        if (settings.lightTheme) {
            root.dataset.theme = 'light';
            root.style.colorScheme = 'light';
        } else {
            delete root.dataset.theme;
            root.style.colorScheme = 'dark';
        }

        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', settings.lightTheme ? '#FEF7FF' : '#141218');
        }

        return () => {
            delete root.dataset.theme;
            root.style.colorScheme = '';
        };
    }, [settings.lightTheme]);

    const activeThemes = useMemo(() => getActiveThemes(sprites), [sprites]);

    // Estado consolidado compatível com as funções puras de query.js e view-export.js
    const trackerState = useMemo(
        () => ({ obtained, mastered, viewMode, filters, settings }),
        [obtained, mastered, viewMode, filters, settings]
    );

    const gridFilters = useMemo(
        () => (deferredSearch === filters.search ? filters : { ...filters, search: deferredSearch }),
        [filters, deferredSearch]
    );

    const gridQueryState = useMemo(
        () => ({ obtained, mastered, viewMode, filters: gridFilters, settings }),
        [obtained, mastered, viewMode, gridFilters, settings]
    );

    const visibleSprites = useMemo(() => {
        const filtered = filterSprites(sprites, gridQueryState);
        return sortSprites(filtered, settings.sortOrder);
    }, [sprites, gridQueryState, settings.sortOrder]);

    const progressStats = useMemo(() => {
        const released = getReleasedSprites(sprites, filters.season);
        return getCollectionCounts(released, { obtained, mastered });
    }, [sprites, filters.season, obtained, mastered]);

    const toggleObtained = useCallback(
        id => {
            if (viewMode) return;
            setCollection(prev => {
                if (prev.mastered.includes(id)) {
                    // Se estiver dominado, clicar remove apenas o domínio (mantém coletado)
                    return {
                        ...prev,
                        mastered: prev.mastered.filter(item => item !== id),
                    };
                }
                if (prev.obtained.includes(id)) {
                    // Se estiver apenas coletado, clicar remove da coleção
                    return {
                        obtained: prev.obtained.filter(item => item !== id),
                        mastered: prev.mastered.filter(item => item !== id),
                    };
                }
                return { ...prev, obtained: [...prev.obtained, id] };
            });
        },
        [viewMode]
    );

    const toggleMastery = useCallback(
        id => {
            if (viewMode) return;
            setCollection(prev => {
                if (!prev.obtained.includes(id)) {
                    return {
                        obtained: [...prev.obtained, id],
                        mastered: [...prev.mastered, id],
                    };
                }
                const mastered = prev.mastered.includes(id)
                    ? prev.mastered.filter(item => item !== id)
                    : [...prev.mastered, id];
                return { ...prev, mastered };
            });
        },
        [viewMode]
    );

    const updateFilter = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const updateSetting = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const importCollection = useCallback(
        (rawObtained, rawMastered) => {
            if (viewMode) return false;
            const validIds = getSpriteIdSet(sprites);
            const cleanObtained = uniqueValidIds(rawObtained, validIds);
            const obtainedSet = new Set(cleanObtained);
            const cleanMastered = uniqueValidIds(rawMastered, validIds).filter(id => obtainedSet.has(id));

            setCollection({ obtained: cleanObtained, mastered: cleanMastered });
            return true;
        },
        [sprites, viewMode]
    );

    // Sai do modo somente leitura e volta para a coleção salva localmente
    const exitViewMode = useCallback(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('c');
        window.history.replaceState({}, '', url.toString());

        setViewMode(false);
        setLoadingShared(false);
        setCollection(getStoredCollection(sprites));
    }, [sprites]);

    return {
        obtained,
        mastered,
        viewMode,
        loadingShared,
        filters,
        settings,
        trackerState,
        activeThemes,
        visibleSprites,
        progressStats,
        toggleObtained,
        toggleMastery,
        updateFilter,
        updateSetting,
        importCollection,
        exitViewMode,
    };
}
