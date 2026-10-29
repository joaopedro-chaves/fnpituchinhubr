import { useState, useEffect, useMemo, useCallback } from 'react';
import { KEYS, STATUS_FILTERS, SORT_METHODS } from '../share-order.js';
import { decompressCollection } from '../share-codec.js';
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
    const mastered = uniqueValidIds(readStoredArray(KEYS.mastered), validIds).filter(id =>
        obtained.includes(id)
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
        };
    });

    const [viewMode, setViewMode] = useState(Boolean(initial.shareCode));
    const [loadingShared, setLoadingShared] = useState(Boolean(initial.shareCode));
    const [collection, setCollection] = useState(initial.collection);
    const [filters, setFilters] = useState(() => getInitialFilters(sprites));
    const [settings, setSettings] = useState(getInitialSettings);

    const { obtained, mastered } = collection;

    // Decodifica a coleção compartilhada (?c=...) enquanto estiver em modo somente leitura
    useEffect(() => {
        if (!viewMode || !initial.shareCode) return;

        let cancelled = false;
        decompressCollection(sprites, initial.shareCode).then(decoded => {
            if (cancelled) return;
            setCollection(decoded);
            setLoadingShared(false);
        });

        return () => {
            cancelled = true;
        };
    }, [viewMode, initial.shareCode, sprites]);

    // Persistência: coleção (nunca sobrescreve a coleção local em modo compartilhado)
    useEffect(() => {
        if (viewMode) return;
        persistValue(KEYS.obtained, collection.obtained);
        persistValue(KEYS.mastered, collection.mastered);
    }, [collection, viewMode]);

    // Persistência: filtros e configurações
    useEffect(() => {
        Object.entries(filters).forEach(([key, value]) => persistValue(KEYS[key], value));
    }, [filters]);

    useEffect(() => {
        Object.entries(settings).forEach(([key, value]) => persistValue(KEYS[key], value));
    }, [settings]);

    // Classe global de baixo desempenho no body
    useEffect(() => {
        document.body.classList.toggle('low-fidelity', settings.lowFidelity);
        return () => document.body.classList.remove('low-fidelity');
    }, [settings.lowFidelity]);

    const activeThemes = useMemo(() => getActiveThemes(sprites), [sprites]);

    // Estado consolidado compatível com as funções puras de query.js e view-export.js
    const trackerState = useMemo(
        () => ({ obtained, mastered, viewMode, filters, settings }),
        [obtained, mastered, viewMode, filters, settings]
    );

    const visibleSprites = useMemo(() => {
        const filtered = filterSprites(sprites, trackerState);
        return sortSprites(filtered, settings.sortOrder);
    }, [sprites, trackerState, settings.sortOrder]);

    const progressStats = useMemo(() => {
        const released = getReleasedSprites(sprites, filters.season);
        return getCollectionCounts(released, trackerState);
    }, [sprites, filters.season, trackerState]);

    const toggleObtained = useCallback(
        id => {
            if (viewMode) return;
            setCollection(prev => {
                if (prev.obtained.includes(id)) {
                    // Remover da coleção também remove de "dominados"
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
                if (!prev.obtained.includes(id)) return prev;
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
