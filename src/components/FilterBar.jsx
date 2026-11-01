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
}) {
    const [activePopup, setActivePopup] = useState(null); // 'export' | 'settings' | null
    const fileInputRef = useRef(null);

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

    const handleExportAction = mode => {
        onExportImage(mode);
        setActivePopup(null);
    };

    const handleTriggerImport = () => {
        setActivePopup(null);
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
                    <button
                        type="button"
                        className="btn"
                        id="exportToggle"
                        aria-haspopup="dialog"
                        aria-expanded={String(activePopup === 'export')}
                        onClick={() => setActivePopup('export')}
                    >
                        Exportar
                    </button>

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
                        className="btn"
                        id="settingsToggle"
                        aria-haspopup="dialog"
                        aria-expanded={String(activePopup === 'settings')}
                        onClick={() => setActivePopup('settings')}
                    >
                        Configurações
                    </button>
                </div>
            </div>

            {/* Popup Modal Centralizado: Exportar */}
            {activePopup === 'export' && (
                <div
                    className="modal-backdrop"
                    onClick={() => setActivePopup(null)}
                    role="presentation"
                >
                    <div
                        className="modal-popup"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="exportPopupTitle"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3 id="exportPopupTitle" className="modal-title">
                                Exportar
                            </h3>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setActivePopup(null)}
                                aria-label="Fechar"
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body" aria-label="Opções de exportação e dados">
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
                                    setActivePopup(null);
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
                                    setActivePopup(null);
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
                                    setActivePopup(null);
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
                </div>
            )}

            {/* Popup Modal Centralizado: Configurações */}
            {activePopup === 'settings' && (
                <div
                    className="modal-backdrop"
                    onClick={() => setActivePopup(null)}
                    role="presentation"
                >
                    <div
                        className="modal-popup"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="settingsPopupTitle"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3 id="settingsPopupTitle" className="modal-title">
                                Configurações
                            </h3>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setActivePopup(null)}
                                aria-label="Fechar"
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body" aria-label="Opções de configuração">
                            <div className="switches">
                                <label className="switch">
                                    <span>Ocultar dominados</span>
                                    <input
                                        type="checkbox"
                                        id="hideMastered"
                                        checked={settings.hideMastered}
                                        onChange={e => onSettingChange('hideMastered', e.target.checked)}
                                    />
                                </label>
                                <label className="switch">
                                    <span>Não lançados</span>
                                    <input
                                        type="checkbox"
                                        id="showUnreleased"
                                        checked={settings.showUnreleased}
                                        onChange={e => onSettingChange('showUnreleased', e.target.checked)}
                                    />
                                </label>
                                <label className="switch">
                                    <span>Baixo Desempenho</span>
                                    <input
                                        type="checkbox"
                                        id="lowFidelity"
                                        checked={settings.lowFidelity}
                                        onChange={e => onSettingChange('lowFidelity', e.target.checked)}
                                    />
                                </label>
                                {!isIOS() && (
                                    <label className="switch" id="exportModeSwitch">
                                        <span>Abrir exportações</span>
                                        <input
                                            type="checkbox"
                                            id="openExports"
                                            checked={settings.openExports}
                                            onChange={e => onSettingChange('openExports', e.target.checked)}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
