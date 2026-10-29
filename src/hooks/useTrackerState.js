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

function getInitialCollection(sprites) {
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

export function useTrackerState(sprites) {
    const initialCollection = useMemo(() => getInitialCollection(sprites), [sprites]);

    const [obtained, setObtained] = useState(initialCollection.obtained);
    const [mastered, setMastered] = useState(initialCollection.mastered);
    const [viewMode, setViewMode] = useState(false);
    const [filters, setFilters] = useState(() => getInitialFilters(sprites));
    const [settings, setSettings] = useState(() => getInitialSettings());

    // Verifica se há código compartilhado (?c=...) na URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shareCode = params.get('c');
        if (!shareCode) return;

        let cancelled = false;
        setViewMode(true);

        decompressCollection(sprites, shareCode).then(decoded => {
            if (cancelled) return;
            setObtained(decoded.obtained);
            setMastered(decoded.mastered);
        });

        return () => {
            cancelled = true;
        };
    }, [sprites]);

    // Sincroniza classe global de baixo desempenho no body
    useEffect(() => {
        document.body.classList.toggle('low-fidelity', settings.lowFidelity);
    }, [settings.lowFidelity]);

    // Temas disponíveis ordenados
    const activeThemes = useMemo(() => getActiveThemes(sprites), [sprites]);

    // Estado consolidado compatível com as funções puras de query.js e view-export.js
    const trackerState = useMemo(
        () => ({
            obtained,
            mastered,
            viewMode,
            filters,
            settings,
        }),
        [obtained, mastered, viewMode, filters, settings]
    );

    // Lista de sprites filtrada e ordenada dinamicamente com useMemo
    const visibleSprites = useMemo(() => {
        const filtered = filterSprites(sprites, trackerState);
        return sortSprites(filtered, settings.sortOrder);
    }, [sprites, trackerState, settings.sortOrder]);

    // Estatísticas de progresso (Coleção e Dominados) com useMemo
    const progressStats = useMemo(() => {
        const released = getReleasedSprites(sprites, filters.season);
        return getCollectionCounts(released, trackerState);
    }, [sprites, filters.season, trackerState]);

    // Alterna estado "Coletado" de um sprite
    const toggleObtained = useCallback(
        id => {
            if (viewMode) return;
            setObtained(prevObtained => {
                const isAlreadyObtained = prevObtained.includes(id);
                const nextObtained = isAlreadyObtained
                    ? prevObtained.filter(item => item !== id)
                    : [...prevObtained, id];

                persistValue(KEYS.obtained, nextObtained);

                if (isAlreadyObtained) {
                    setMastered(prevMastered => {
                        const nextMastered = prevMastered.filter(item => item !== id);
                        persistValue(KEYS.mastered, nextMastered);
                        return nextMastered;
                    });
                }

                return nextObtained;
            });
        },
        [viewMode]
    );

    // Alterna estado "Dominado" (Coroa) de um sprite já coletado
    const toggleMastery = useCallback(
        id => {
            if (viewMode) return;
            setObtained(currentObtained => {
                if (!currentObtained.includes(id)) return currentObtained;

                setMastered(prevMastered => {
                    const isAlreadyMastered = prevMastered.includes(id);
                    const nextMastered = isAlreadyMastered
                        ? prevMastered.filter(item => item !== id)
                        : [...prevMastered, id];
                    persistValue(KEYS.mastered, nextMastered);
                    return nextMastered;
                });

                return currentObtained;
            });
        },
        [viewMode]
    );

    // Atualiza um filtro individual (search, theme, season, status)
    const updateFilter = useCallback((key, value) => {
        setFilters(prev => {
            const next = { ...prev, [key]: value };
            if (KEYS[key]) persistValue(KEYS[key], value);
            return next;
        });
    }, []);

    // Atualiza uma configuração individual (sortOrder, hideMastered, showUnreleased, lowFidelity, openExports)
    const updateSetting = useCallback((key, value) => {
        setSettings(prev => {
            const next = { ...prev, [key]: value };
            if (KEYS[key]) persistValue(KEYS[key], value);
            return next;
        });
    }, []);

    // Importa backup JSON validando IDs
    const importCollection = useCallback(
        (rawObtained, rawMastered) => {
            if (viewMode) return false;
            const validIds = getSpriteIdSet(sprites);
            const cleanObtained = uniqueValidIds(rawObtained, validIds);
            const obtainedSet = new Set(cleanObtained);
            const cleanMastered = uniqueValidIds(rawMastered, validIds).filter(id => obtainedSet.has(id));

            setObtained(cleanObtained);
            setMastered(cleanMastered);
            persistValue(KEYS.obtained, cleanObtained);
            persistValue(KEYS.mastered, cleanMastered);
            return true;
        },
        [sprites, viewMode]
    );

    // Sai do modo somente leitura (coleção compartilhada) e volta para a coleção local
    const exitViewMode = useCallback(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('c');
        window.history.replaceState({}, '', url.toString());

        const local = getInitialCollection(sprites);
        setViewMode(false);
        setObtained(local.obtained);
        setMastered(local.mastered);
    }, [sprites]);

    return {
        obtained,
        mastered,
        viewMode,
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
