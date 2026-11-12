import { isIOS } from '../dom-utils.js';

export default function SettingsModal({ settings, onSettingChange, onClose }) {
    return (
        <div className="modal-backdrop" onClick={onClose} role="presentation">
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
                        onClick={onClose}
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
    );
}

