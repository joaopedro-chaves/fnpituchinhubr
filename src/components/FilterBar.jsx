import { useState, useEffect, useRef } from 'react';
import { getUiThemeLabel } from '../query.js';
import { isIOS } from '../dom-utils.js';

const STATUS_PILLS = [
    { value: 'all', label: 'Todos' },
    { value: 'owned', label: 'Coletados' },
    { value: 'missing', label: 'Faltando' },
];

export function FilterBar({
    filters,
    settings,
    activeThemes,
    viewMode,
    onFilterChange,
    onSettingChange,
    onExportImage,
    onCopyTradeText,
    onCopyTradeGrid,
    onExportBackup,
    onImportBackupFile,
    onShare,
    onOpenCodes,
}) {
    const [openDropdown, setOpenDropdown] = useState(null); // 'export' | 'settings' | null
    const exportRef = useRef(null);
    const settingsRef = useRef(null);
    const fileInputRef = useRef(null);

    // Fecha dropdowns ao clicar fora ou pressionar Escape
    useEffect(() => {
        const handleDocumentClick = e => {
            if (
                openDropdown === 'export' &&
                exportRef.current &&
                !exportRef.current.contains(e.target)
            ) {
                setOpenDropdown(null);
            }
            if (
                openDropdown === 'settings' &&
                settingsRef.current &&
                !settingsRef.current.contains(e.target)
            ) {
                setOpenDropdown(null);
            }
        };

        const handleKeyDown = e => {
            if (e.key === 'Escape') {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('click', handleDocumentClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [openDropdown]);

    const handleExportAction = mode => {
        onExportImage(mode);
        setOpenDropdown(null);
    };

    const handleTriggerImport = () => {
        setOpenDropdown(null);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = e => {
        const file = e.target.files?.[0];
        if (file) {
            onImportBackupFile(file);
        }
        e.target.value = '';
    };

    return (
        <nav className="toolbar">
            <div className="toolbar-row">
                <label className="sr-only" htmlFor="searchInput">
                    Buscar
                </label>
                <input
                    type="search"
                    id="searchInput"
                    className="input"
                    placeholder="Buscar…"
                    autoComplete="off"
                    spellCheck="false"
                    value={filters.search}
                    onChange={e => onFilterChange('search', e.target.value)}
                />

                <label className="sr-only" htmlFor="themeFilter">
                    Temas
                </label>
                <select
                    id="themeFilter"
                    className="select"
                    value={filters.theme}
                    onChange={e => onFilterChange('theme', e.target.value)}
                >
                    <option value="all">Todos</option>
                    {activeThemes.map(theme => (
                        <option key={theme} value={theme}>
                            {getUiThemeLabel(theme)}
                        </option>
                    ))}
                </select>

                <label className="sr-only" htmlFor="seasonFilter">
                    Temporada
                </label>
                <select
                    id="seasonFilter"
                    className="select"
                    value={filters.season}
                    onChange={e => onFilterChange('season', e.target.value)}
                >
                    <option value="all">Todas Tempo.</option>
                    <option value="C7T3">C7T3</option>
                    <option value="C7T4">C7T4</option>
                </select>

                <label className="sr-only" htmlFor="sortOrder">
                    Ordenar
                </label>
                <select
                    id="sortOrder"
                    className="select"
                    value={settings.sortOrder}
                    onChange={e => onSettingChange('sortOrder', e.target.value)}
                >
                    <option value="theme">Tema</option>
                    <option value="sprite">Elementais</option>
                    <option value="name">Nome</option>
                    <option value="rarity">Raridade</option>
                </select>

                <div className="pills" id="statusPills">
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

            <div className="toolbar-row">
                <div className="actions">
                    <div
                        ref={exportRef}
                        className={`dropdown${openDropdown === 'export' ? ' open' : ''}`}
                        id="exportDropdown"
                    >
                        <button
                            type="button"
                            className="btn"
                            id="exportToggle"
                            aria-haspopup="true"
                            aria-expanded={String(openDropdown === 'export')}
                            onClick={e => {
                                e.stopPropagation();
                                setOpenDropdown(prev => (prev === 'export' ? null : 'export'));
                            }}
                        >
                            Exportar
                        </button>
                        <div className="dropdown-menu" aria-label="Opções de exportação e dados">
                            <div className="dropdown-section-title">Imagens</div>
                            <button type="button" onClick={() => handleExportAction('collected')}>
                                <span className="dot dot-collected" />
                                Coleção
                            </button>
                            <button type="button" onClick={() => handleExportAction('missing')}>
                                <span className="dot dot-missing" />
                                Faltando
                            </button>
                            <button type="button" onClick={() => handleExportAction('unmastered')}>
                                <span className="dot dot-unmastered" />
                                Não dominados
                            </button>
                            <button type="button" onClick={() => handleExportAction('mastered')}>
                                <span className="dot dot-mastered" />
                                Dominados
                            </button>
                            <button type="button" onClick={() => handleExportAction('trade')}>
                                <span className="dot dot-trade" />
                                Trocar
                            </button>
                            <hr className="dropdown-divider" />
                            <div className="dropdown-section-title">Trocas</div>
                            <button
                                type="button"
                                id="copyTradeTextBtn"
                                onClick={() => {
                                    onCopyTradeText();
                                    setOpenDropdown(null);
                                }}
                            >
                                <span className="dot dot-text" />
                                Lista de trocas (texto)
                            </button>
                            <button
                                type="button"
                                id="copyTradeGridBtn"
                                onClick={() => {
                                    onCopyTradeGrid();
                                    setOpenDropdown(null);
                                }}
                            >
                                <span className="dot dot-text" />
                                Grade de trocas (texto)
                            </button>
                            <hr className="dropdown-divider" />
                            <div className="dropdown-section-title">Dados</div>
                            <button
                                type="button"
                                id="exportBackupBtn"
                                onClick={() => {
                                    onExportBackup();
                                    setOpenDropdown(null);
                                }}
                            >
                                <span className="dot dot-backup" />
                                Backup dos dados (JSON)
                            </button>
                            <button type="button" id="importBtn" onClick={handleTriggerImport}>
                                <span className="dot dot-collected" />
                                Importar dados (JSON)
                            </button>
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        id="importInput"
                        className="file-input"
                        accept=".json"
                        onChange={handleFileChange}
                    />

                    <button type="button" className="btn" id="shareBtn" onClick={onShare}>
                        Compartilhar
                    </button>

                    <button
                        type="button"
                        style={{ fontFamily: "'Roboto Mono'", fontWeight: 'bold' }}
                        className="btn btn-codes"
                        id="codesBtn"
                        onClick={onOpenCodes}
                    >
                        Trapaças
                    </button>

                    <div
                        ref={settingsRef}
                        className={`dropdown${openDropdown === 'settings' ? ' open' : ''}`}
                        id="settingsDropdown"
                    >
                        <button
                            type="button"
                            className="btn"
                            id="settingsToggle"
                            aria-haspopup="true"
                            aria-expanded={String(openDropdown === 'settings')}
                            onClick={e => {
                                e.stopPropagation();
                                setOpenDropdown(prev => (prev === 'settings' ? null : 'settings'));
                            }}
                        >
                            Configurações
                        </button>
                        <div
                            className="dropdown-menu"
                            aria-label="Opções de configuração"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="switches">
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        id="hideMastered"
                                        checked={settings.hideMastered}
                                        onChange={e => onSettingChange('hideMastered', e.target.checked)}
                                    />
                                    <span>Ocultar dominados</span>
                                </label>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        id="showUnreleased"
                                        checked={settings.showUnreleased}
                                        onChange={e => onSettingChange('showUnreleased', e.target.checked)}
                                    />
                                    <span>Não lançados</span>
                                </label>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        id="lowFidelity"
                                        checked={settings.lowFidelity}
                                        onChange={e => onSettingChange('lowFidelity', e.target.checked)}
                                    />
                                    <span>Baixo Desempenho</span>
                                </label>
                                {!isIOS() && (
                                    <label className="switch" id="exportModeSwitch">
                                        <input
                                            type="checkbox"
                                            id="openExports"
                                            checked={settings.openExports}
                                            onChange={e => onSettingChange('openExports', e.target.checked)}
                                        />
                                        <span>Abrir exportações</span>
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
