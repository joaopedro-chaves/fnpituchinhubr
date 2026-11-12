import { isIOS } from '../dom-utils.js';
import { ModalDialog } from './ModalDialog.jsx';

export default function SettingsModal({ settings, onSettingChange, onClose }) {
    return (
        <ModalDialog
            title="Configurações"
            titleId="settingsPopupTitle"
            bodyAriaLabel="Opções de configuração"
            onClose={onClose}
        >
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
                <label className="switch">
                    <span>Tema claro</span>
                    <input
                        type="checkbox"
                        id="lightTheme"
                        checked={settings.lightTheme}
                        onChange={e => onSettingChange('lightTheme', e.target.checked)}
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
        </ModalDialog>
    );
}

