import { memo, useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { getUiThemeLabel } from '../query.js';

const loadExportModal = () => import('./ExportModal.jsx');
const loadSettingsModal = () => import('./SettingsModal.jsx');
const ExportModal = lazy(loadExportModal);
const SettingsModal = lazy(loadSettingsModal);

const STATUS_PILLS = [
    { value: 'all', label: 'Todos' },
    { value: 'owned', label: 'Coletados' },
    { value: 'missing', label: 'Faltando' },
];

const SEASON_OPTIONS = [
    { value: 'all', label: 'Temporadas' },
    { value: 'C7T3', label: 'C7T3' },
    { value: 'C7T4', label: 'C7T4' },
    { value: 'C7T5', label: 'C7T5' },
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

const M3FilterMenu = memo(function M3FilterMenu({
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
        const items = Array.from(menuRef.current?.querySelectorAll('button.m3-menu-item') || []);
        if (!items.length) return;
        const currentIndex = items.indexOf(document.activeElement);

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
                aria-expanded={String(isOpen)}
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
                    {...{ focusgroup: 'menu nomemory' }}
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
                                    aria-checked={String(isSelected)}
                                    className={`m3-menu-item${isSelected ? ' selected' : ''}`}
                                    onClick={() => {
                                        onSelect(option.value);
                                        onClose();
                                        triggerRef.current?.focus({ focusVisible: false });
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

export const FilterBar = memo(function FilterBar({
    filters,
    settings,
    activeThemes,
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
}) {
    if (import.meta.env.MODE === 'test' && typeof window !== 'undefined') {
        window.__recordPerfRender?.('filterBar');
    }

    const [activePopup, setActivePopup] = useState(null); // 'export' | 'settings' | null
    const [openFilterMenu, setOpenFilterMenu] = useState(null); // 'theme' | 'season' | 'sortOrder' | null
    const fileInputRef = useRef(null);
    const filtersRowRef = useRef(null);

    // Fecha menu M3 ao clicar fora ou perder o foco no desktop
    useEffect(() => {
        if (!openFilterMenu) return;

        const handlePointerDown = e => {
            if (filtersRowRef.current && !filtersRowRef.current.contains(e.target)) {
                setOpenFilterMenu(null);
            }
        };

        const handleFocusIn = e => {
            if (filtersRowRef.current && !filtersRowRef.current.contains(e.target)) {
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

    // Fecha popup ao pressionar Escape e previne rolagem do fundo
    useEffect(() => {
        if (!activePopup) return;

        const handleKeyDown = e => {
            if (e.key === 'Escape') {
                setActivePopup(null);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [activePopup]);

    const handleClosePopup = useCallback(() => setActivePopup(null), []);

    const handleExportAction = useCallback(
        mode => {
            onExportImage(mode);
            setActivePopup(null);
        },
        [onExportImage]
    );

    const handleTriggerImport = useCallback(() => {
        setActivePopup(null);
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

    return (
        <nav className="toolbar" aria-label="Filtros e ações da coleção">
            <search className="toolbar-search">
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

                        <div className="pills" id="statusPills" role="group" aria-label="Filtro de status">
                            {STATUS_PILLS.map(pill => {
                                const isActive = filters.status === pill.value;
                                return (
                                    <button
                                        key={pill.value}
                                        type="button"
                                        className={`pill${isActive ? ' active' : ''}`}
                                        data-status={pill.value}
                                        aria-pressed={String(isActive)}
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
                            aria-expanded={String(activePopup === 'export')}
                            onPointerEnter={handlePrefetchExport}
                            onFocus={handlePrefetchExport}
                            onClick={() => {
                                handlePrefetchExport();
                                setActivePopup('export');
                            }}
                        >
                            <ExportIcon />
                            <span className="btn-label">Exportar</span>
                        </button>

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
                            aria-expanded={String(activePopup === 'settings')}
                            onPointerEnter={handlePrefetchSettings}
                            onFocus={handlePrefetchSettings}
                            onClick={() => {
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
                    <M3FilterMenu
                        id="themeFilter"
                        label="Tipos"
                        value={filters.theme}
                        defaultValue="all"
                        options={themeOptions}
                        isOpen={openFilterMenu === 'theme'}
                        onToggle={handleToggleThemeMenu}
                        onClose={handleCloseFilterMenu}
                        onSelect={handleSelectTheme}
                    />

                    <M3FilterMenu
                        id="seasonFilter"
                        label="Temporadas"
                        value={filters.season}
                        defaultValue="all"
                        options={SEASON_OPTIONS}
                        isOpen={openFilterMenu === 'season'}
                        onToggle={handleToggleSeasonMenu}
                        onClose={handleCloseFilterMenu}
                        onSelect={handleSelectSeason}
                    />

                    <M3FilterMenu
                        id="sortOrder"
                        label="Categorias"
                        value={settings.sortOrder}
                        defaultValue="theme"
                        options={SORT_OPTIONS}
                        isOpen={openFilterMenu === 'sortOrder'}
                        onToggle={handleToggleSortOrderMenu}
                        onClose={handleCloseFilterMenu}
                        onSelect={handleSelectSortOrder}
                    />

                    {/* Mobile Native Selects (max-width: 767px) */}
                    <label className="sr-only" htmlFor="themeFilter">
                        Tipos
                    </label>
                    <select
                        id="themeFilter"
                        name="theme"
                        className="select filter-chip mobile-filter-select"
                        value={filters.theme}
                        onChange={e => onFilterChange('theme', e.target.value)}
                    >
                        <option value="all">Tipos</option>
                        {activeThemes.map(theme => (
                            <option key={theme} value={theme}>
                                {getUiThemeLabel(theme)}
                            </option>
                        ))}
                    </select>

                    <label className="sr-only" htmlFor="seasonFilter">
                        Temporadas
                    </label>
                    <select
                        id="seasonFilter"
                        name="season"
                        className="select filter-chip mobile-filter-select"
                        value={filters.season}
                        onChange={e => onFilterChange('season', e.target.value)}
                    >
                        <option value="all">Temporadas</option>
                        <option value="C7T3">C7T3</option>
                        <option value="C7T4">C7T4</option>
                        <option value="C7T5">C7T5</option>
                    </select>

                    <label className="sr-only" htmlFor="sortOrder">
                        Categorias
                    </label>
                    <select
                        id="sortOrder"
                        name="sortOrder"
                        className="select filter-chip mobile-filter-select"
                        value={settings.sortOrder}
                        onChange={e => onSettingChange('sortOrder', e.target.value)}
                    >
                        <option value="theme">Categorias</option>
                        <option value="sprite">Elementais</option>
                        <option value="name">Nome</option>
                        <option value="rarity">Raridade</option>
                    </select>
                </div>
            </search>

            {/* Popup Modal Centralizado: Exportar */}
            {activePopup === 'export' && (
                <Suspense fallback={null}>
                    <ExportModal
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
        </nav>
    );
});
