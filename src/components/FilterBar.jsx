import { Fragment, memo, useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { getUiThemeLabel } from '../query.js';

const loadExportModal = () => import('./ExportModal.jsx');
const loadSettingsModal = () => import('./SettingsModal.jsx');
const loadBatchModal = () => import('./BatchModal.jsx');
const ExportModal = lazy(loadExportModal);
const SettingsModal = lazy(loadSettingsModal);
const BatchModal = lazy(loadBatchModal);

const EMPTY_SEASONS = [];

const STATUS_PILLS = [
    { value: 'all', label: 'Todos' },
    { value: 'owned', label: 'Coletados' },
    { value: 'missing', label: 'Faltando' },
];

const SORT_OPTIONS = [
    { value: 'theme', label: 'Categorias' },
    { value: 'sprite', label: 'Elementais' },
    { value: 'name', label: 'Nome' },
    { value: 'rarity', label: 'Raridade' },
];

function SearchIcon() {
    return (
        <svg
            className="search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="7" />
            <line x1="20" y1="20" x2="16.2" y2="16.2" />
        </svg>
    );
}

function ExportIcon() {
    return (
        <svg
            className="btn-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    );
}

function ShareIcon() {
    return (
        <svg
            className="btn-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg
            className="btn-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}

function BatchIcon() {
    return (
        <svg
            className="btn-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
    );
}

/** @param {{ open: boolean }} props */
function DropdownArrowIcon({ open }) {
    return (
        <svg
            className={`m3-chip-arrow${open ? ' open' : ''}`}
            width="10"
            height="6"
            viewBox="0 0 10 6"
            aria-hidden="true"
        >
            <path fill="currentColor" d="M0 0l5 6 5-6z" />
        </svg>
    );
}

const M3FilterMenu = memo(
    /**
     * @param {{
     *   id: string,
     *   label: string,
     *   value: string,
     *   defaultValue: string,
     *   options: Array<{ value: string, label: string }>,
     *   isOpen: boolean,
     *   onToggle: () => void,
     *   onClose: () => void,
     *   onSelect: (value: string) => void,
     * }} props
     */
    function M3FilterMenu({
    id,
    label,
    value,
    defaultValue,
    options,
    isOpen,
    onToggle,
    onClose,
    onSelect,
}) {
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value) || options[0];
    const isFiltered = value !== defaultValue;

    const handleTriggerKeyDown = e => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!isOpen) {
                onToggle();
            }
            requestAnimationFrame(() => {
                const items = menuRef.current?.querySelectorAll('button.m3-menu-item');
                if (items?.length) {
                    const selectedIdx = options.findIndex(opt => opt.value === value);
                    const targetIdx = selectedIdx >= 0 ? selectedIdx : 0;
                    items[targetIdx]?.focus({ preventScroll: true });
                }
            });
        } else if (e.key === 'Escape' && isOpen) {
            e.preventDefault();
            onClose();
        }
    };

    const handleMenuKeyDown = e => {
        const items = /** @type {HTMLButtonElement[]} */ (
            Array.from(menuRef.current?.querySelectorAll('button.m3-menu-item') || [])
        );
        if (!items.length) return;
        const currentIndex =
            document.activeElement instanceof HTMLButtonElement
                ? items.indexOf(document.activeElement)
                : -1;

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            e.stopPropagation();
            let nextIndex = 0;
            if (e.key === 'Home') {
                nextIndex = 0;
            } else if (e.key === 'End') {
                nextIndex = items.length - 1;
            } else if (currentIndex < 0) {
                nextIndex = 0;
            } else {
                const delta = e.key === 'ArrowUp' ? -1 : 1;
                nextIndex = (currentIndex + delta + items.length) % items.length;
            }
            items[nextIndex]?.focus({ preventScroll: true });
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            onClose();
            triggerRef.current?.focus();
        } else if (e.key === 'Tab') {
            onClose();
        }
    };

    return (
        <div className={`m3-filter-dropdown${isOpen ? ' open' : ''}`} ref={containerRef}>
            <button
                ref={triggerRef}
                type="button"
                id={`${id}MenuTrigger`}
                className={`select filter-chip m3-menu-trigger${isFiltered ? ' is-filtered' : ''}${isOpen ? ' open' : ''}`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label={`${label}: ${selectedOption?.label || label}`}
                onClick={onToggle}
                onKeyDown={handleTriggerKeyDown}
            >
                <span className="m3-chip-label">{selectedOption?.label || label}</span>
                <DropdownArrowIcon open={isOpen} />
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className="m3-menu"
                    role="menu"
                    aria-labelledby={`${id}MenuTrigger`}
                    onKeyDown={handleMenuKeyDown}
                >
                    <div role="group" aria-label={label}>
                        {options.map(option => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="menuitemradio"
                                    aria-checked={isSelected}
                                    className={`m3-menu-item${isSelected ? ' selected' : ''}`}
                                    onClick={() => {
                                        onSelect(option.value);
                                        onClose();
                                        triggerRef.current?.focus({ preventScroll: true });
                                    }}
                                >
                                    <span className="m3-menu-item-text">{option.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
});

export const FilterBar = memo(
    /**
     * @param {{
     *   filters: { search: string, theme: string, season: string, status: string },
     *   settings: {
     *     hideMastered: boolean,
     *     sortOrder: string,
     *     showUnreleased: boolean,
     *     lowFidelity: boolean,
     *     openExports: boolean,
     *     lightTheme: boolean,
     *   },
     *   activeThemes: string[],
     *   activeSeasons?: string[],
     *   viewMode: boolean,
     *   onFilterChange: (key: string, value: string) => void,
     *   onSettingChange: (key: string, value: any) => void,
     *   onPrepareExport?: () => void,
     *   onExportImage: (mode: string) => void,
     *   onCopyTradeText: () => void,
     *   onCopyTradeGrid: () => void,
     *   onExportBackup: () => void,
     *   onImportBackupFile: (file: File) => void,
     *   onShare: () => void,
     *   getBatchContext?: () => { visibleIds: string[], scopeSprites: Array<{ id: string, name: string, season?: string, unreleased?: boolean }> },
     *   onApplyBatch?: (targetIds: string[], action: 'collect' | 'master' | 'unmaster' | 'uncollect') => void,
     * }} props
     */
    function FilterBar({
    filters,
    settings,
    activeThemes,
    activeSeasons = EMPTY_SEASONS,
    viewMode,
    onFilterChange,
    onSettingChange,
    onPrepareExport,
    onExportImage,
    onCopyTradeText,
    onCopyTradeGrid,
    onExportBackup,
    onImportBackupFile,
    onShare,
    getBatchContext,
    onApplyBatch,
}) {
    if (import.meta.env.MODE === 'test' && typeof window !== 'undefined') {
        window.__recordPerfRender?.('filterBar');
    }

    const [activePopup, setActivePopup] = useState(null); // 'export' | 'settings' | 'batch' | null
    const [batchContext, setBatchContext] = useState(
        /** @type {{ visibleIds: string[], scopeSprites: Array<{ id: string, name: string, season?: string, unreleased?: boolean }> } | null} */ (
            null
        )
    );
    const [openFilterMenu, setOpenFilterMenu] = useState(null); // 'theme' | 'season' | 'sortOrder' | null
    const fileInputRef = useRef(null);
    const filtersRowRef = useRef(null);
    const popupInvokerRef = useRef(null);
    const prevPopupRef = useRef(null);

    // Restaura foco ao gatilho apenas se o ambiente/suspense não devolver o foco nativamente ao fechar o dialog
    useEffect(() => {
        if (prevPopupRef.current && !activePopup) {
            const invoker = popupInvokerRef.current;
            queueMicrotask(() => {
                if (
                    invoker?.isConnected &&
                    (!document.activeElement || document.activeElement === document.body)
                ) {
                    invoker.focus({ preventScroll: true });
                }
            });
        }
        prevPopupRef.current = activePopup;
    }, [activePopup]);

    // Fecha menu M3 ao clicar fora ou perder o foco no desktop
    useEffect(() => {
        if (!openFilterMenu) return;

        const handlePointerDown = e => {
            if (
                filtersRowRef.current &&
                e.target instanceof Node &&
                !filtersRowRef.current.contains(e.target)
            ) {
                setOpenFilterMenu(null);
            }
        };

        const handleFocusIn = e => {
            if (
                filtersRowRef.current &&
                e.target instanceof Node &&
                !filtersRowRef.current.contains(e.target)
            ) {
                setOpenFilterMenu(null);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('focusin', handleFocusIn);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('focusin', handleFocusIn);
        };
    }, [openFilterMenu]);

    const handleClosePopup = useCallback(() => setActivePopup(null), []);

    const handleExportAction = useCallback(
        mode => {
            onExportImage(mode);
        },
        [onExportImage]
    );

    const handleTriggerImport = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);

    const handlePrefetchExport = useCallback(() => {
        void loadExportModal().catch(() => {});
        onPrepareExport?.();
    }, [onPrepareExport]);

    const handlePrefetchSettings = useCallback(() => {
        void loadSettingsModal().catch(() => {});
    }, []);

    const handlePrefetchBatch = useCallback(() => {
        void loadBatchModal().catch(() => {});
    }, []);

    const handleFileChange = e => {
        const file = e.target.files?.[0];
        if (file) {
            onImportBackupFile(file);
        }
        e.target.value = '';
    };

    const themeOptions = useMemo(
        () => [
            { value: 'all', label: 'Tipos' },
            ...activeThemes.map(theme => ({
                value: theme,
                label: getUiThemeLabel(theme),
            })),
        ],
        [activeThemes]
    );

    const seasonOptions = useMemo(
        () => [
            { value: 'all', label: 'Temporadas' },
            ...activeSeasons.map(season => ({
                value: season,
                label: season,
            })),
        ],
        [activeSeasons]
    );

    const handleToggleThemeMenu = useCallback(
        () => setOpenFilterMenu(prev => (prev === 'theme' ? null : 'theme')),
        []
    );
    const handleToggleSeasonMenu = useCallback(
        () => setOpenFilterMenu(prev => (prev === 'season' ? null : 'season')),
        []
    );
    const handleToggleSortOrderMenu = useCallback(
        () => setOpenFilterMenu(prev => (prev === 'sortOrder' ? null : 'sortOrder')),
        []
    );
    const handleCloseFilterMenu = useCallback(() => setOpenFilterMenu(null), []);
    const handleSelectTheme = useCallback(val => onFilterChange('theme', val), [onFilterChange]);
    const handleSelectSeason = useCallback(val => onFilterChange('season', val), [onFilterChange]);
    const handleSelectSortOrder = useCallback(
        val => onSettingChange('sortOrder', val),
        [onSettingChange]
    );

    const filterConfigs = useMemo(
        () => [
            {
                id: 'themeFilter',
                mobileId: 'themeFilterMobile',
                menuKey: 'theme',
                name: 'theme',
                label: 'Tipos',
                value: filters.theme,
                defaultValue: 'all',
                options: themeOptions,
                onToggle: handleToggleThemeMenu,
                onSelect: handleSelectTheme,
            },
            {
                id: 'seasonFilter',
                mobileId: 'seasonFilterMobile',
                menuKey: 'season',
                name: 'season',
                label: 'Temporadas',
                value: filters.season,
                defaultValue: 'all',
                options: seasonOptions,
                onToggle: handleToggleSeasonMenu,
                onSelect: handleSelectSeason,
            },
            {
                id: 'sortOrder',
                mobileId: 'sortOrderMobile',
                menuKey: 'sortOrder',
                name: 'sortOrder',
                label: 'Categorias',
                value: settings.sortOrder,
                defaultValue: 'theme',
                options: SORT_OPTIONS,
                onToggle: handleToggleSortOrderMenu,
                onSelect: handleSelectSortOrder,
            },
        ],
        [
            filters.theme,
            filters.season,
            settings.sortOrder,
            themeOptions,
            seasonOptions,
            handleToggleThemeMenu,
            handleToggleSeasonMenu,
            handleToggleSortOrderMenu,
            handleSelectTheme,
            handleSelectSeason,
            handleSelectSortOrder,
        ]
    );

    return (
        <div className="toolbar">
            <div className="toolbar-search" role="search" aria-label="Buscar e filtrar pituchinhos">
                {/* 1ª Linha: Busca + Segmented Button à esquerda; Botões de Ação à direita */}
                <div className="toolbar-row toolbar-row-primary">
                    <div className="toolbar-primary-left">
                        <label className="sr-only" htmlFor="searchInput">
                            Buscar
                        </label>
                        <div className="search-bar">
                            <SearchIcon />
                            <input
                                type="search"
                                id="searchInput"
                                name="search"
                                className="search-input"
                                placeholder="Buscar..."
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="none"
                                spellCheck="false"
                                value={filters.search}
                                onChange={e => onFilterChange('search', e.target.value)}
                            />
                        </div>

                        <div
                            className={`pills${viewMode ? ' is-view-mode' : ''}`}
                            id="statusPills"
                            role="group"
                            aria-label="Filtro de status"
                        >
                            {STATUS_PILLS.map(pill => {
                                const isActive = viewMode
                                    ? pill.value === 'owned'
                                    : filters.status === pill.value;
                                return (
                                    <button
                                        key={pill.value}
                                        type="button"
                                        className={`pill${isActive ? ' active' : ''}`}
                                        data-status={pill.value}
                                        aria-pressed={isActive}
                                        disabled={viewMode}
                                        onClick={() => {
                                            if (!viewMode) onFilterChange('status', pill.value);
                                        }}
                                    >
                                        {pill.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="actions">
                        <button
                            type="button"
                            className="btn"
                            id="exportToggle"
                            aria-label="Exportar"
                            aria-haspopup="dialog"
                            aria-expanded={activePopup === 'export'}
                            onPointerEnter={handlePrefetchExport}
                            onFocus={handlePrefetchExport}
                            onClick={e => {
                                popupInvokerRef.current = e.currentTarget;
                                handlePrefetchExport();
                                setActivePopup('export');
                            }}
                        >
                            <ExportIcon />
                            <span className="btn-label">Exportar</span>
                        </button>

                        {!viewMode && (
                            <button
                                type="button"
                                className="btn"
                                id="batchToggle"
                                aria-label="Ações em lote"
                                aria-haspopup="dialog"
                                aria-expanded={activePopup === 'batch'}
                                onPointerEnter={handlePrefetchBatch}
                                onFocus={handlePrefetchBatch}
                                onClick={e => {
                                    popupInvokerRef.current = e.currentTarget;
                                    handlePrefetchBatch();
                                    setBatchContext(
                                        getBatchContext
                                            ? getBatchContext()
                                            : { visibleIds: [], scopeSprites: [] }
                                    );
                                    setActivePopup('batch');
                                }}
                            >
                                <BatchIcon />
                                <span className="btn-label">Em lote</span>
                            </button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            id="importInput"
                            name="importBackup"
                            className="file-input"
                            accept=".json"
                            onChange={handleFileChange}
                        />

                        <button
                            type="button"
                            className="btn"
                            id="shareBtn"
                            aria-label="Compartilhar"
                            onClick={onShare}
                        >
                            <ShareIcon />
                            <span className="btn-label">Compartilhar</span>
                        </button>

                        <button
                            type="button"
                            className="btn"
                            id="settingsToggle"
                            aria-label="Configurações"
                            aria-haspopup="dialog"
                            aria-expanded={activePopup === 'settings'}
                            onPointerEnter={handlePrefetchSettings}
                            onFocus={handlePrefetchSettings}
                            onClick={e => {
                                popupInvokerRef.current = e.currentTarget;
                                handlePrefetchSettings();
                                setActivePopup('settings');
                            }}
                        >
                            <SettingsIcon />
                            <span className="btn-label">Configurações</span>
                        </button>
                    </div>
                </div>

                {/* 2ª Linha: Filtros Secundários (M3 Menu no Desktop >=768px / Select Nativo no Mobile <=767px) */}
                <div className="toolbar-row toolbar-row-filters" ref={filtersRowRef}>
                    {/* Desktop M3 Menus (min-width: 768px) */}
                    {filterConfigs.map(cfg => (
                        <M3FilterMenu
                            key={cfg.id}
                            id={cfg.id}
                            label={cfg.label}
                            value={cfg.value}
                            defaultValue={cfg.defaultValue}
                            options={cfg.options}
                            isOpen={openFilterMenu === cfg.menuKey}
                            onToggle={cfg.onToggle}
                            onClose={handleCloseFilterMenu}
                            onSelect={cfg.onSelect}
                        />
                    ))}

                    {/* Mobile Native Selects (max-width: 767px) */}
                    {filterConfigs.map(cfg => (
                        <Fragment key={cfg.mobileId}>
                            <label className="sr-only" htmlFor={cfg.mobileId}>
                                {cfg.label}
                            </label>
                            <select
                                id={cfg.mobileId}
                                name={cfg.name}
                                className="select filter-chip mobile-filter-select"
                                value={cfg.value}
                                onChange={e => cfg.onSelect(e.target.value)}
                            >
                                {cfg.options.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </Fragment>
                    ))}
                </div>
            </div>

            {/* Popup Modal Centralizado: Exportar */}
            {activePopup === 'export' && (
                <Suspense fallback={null}>
                    <ExportModal
                        viewMode={viewMode}
                        onClose={handleClosePopup}
                        onExportImage={handleExportAction}
                        onCopyTradeText={onCopyTradeText}
                        onCopyTradeGrid={onCopyTradeGrid}
                        onExportBackup={onExportBackup}
                        onTriggerImport={handleTriggerImport}
                    />
                </Suspense>
            )}

            {/* Popup Modal Centralizado: Configurações */}
            {activePopup === 'settings' && (
                <Suspense fallback={null}>
                    <SettingsModal
                        settings={settings}
                        onSettingChange={onSettingChange}
                        onClose={handleClosePopup}
                    />
                </Suspense>
            )}

            {/* Popup Modal Centralizado: Ações em lote */}
            {activePopup === 'batch' && !viewMode && batchContext && onApplyBatch && (
                <Suspense fallback={null}>
                    <BatchModal
                        activeSeasons={activeSeasons}
                        initialSeason={filters.season}
                        visibleIds={batchContext.visibleIds}
                        scopeSprites={batchContext.scopeSprites}
                        onApply={onApplyBatch}
                        onClose={handleClosePopup}
                    />
                </Suspense>
            )}
        </div>
    );
});
