import { ModalDialog, closeEnclosingDialog } from './ModalDialog.jsx';

const IMAGE_EXPORT_OPTIONS = [
    { mode: 'collected', dotClass: 'dot-collected', label: 'Coleção' },
    { mode: 'missing', dotClass: 'dot-missing', label: 'Faltando' },
    { mode: 'unmastered', dotClass: 'dot-unmastered', label: 'Não dominados' },
    { mode: 'mastered', dotClass: 'dot-mastered', label: 'Dominados' },
    { mode: 'trade', dotClass: 'dot-trade', label: 'Trocar' },
];

export default function ExportModal({
    viewMode = false,
    onClose,
    onExportImage,
    onCopyTradeText,
    onCopyTradeGrid,
    onExportBackup,
    onTriggerImport,
}) {
    const closeAndRun = (e, action) => {
        closeEnclosingDialog(e.currentTarget, () => {
            onClose();
            action();
        });
    };

    return (
        <ModalDialog
            title="Exportar"
            titleId="exportPopupTitle"
            bodyAriaLabel="Opções de exportação e dados"
            onClose={onClose}
        >
            <div className="dropdown-section-title">Imagens</div>
            {IMAGE_EXPORT_OPTIONS.map(option => (
                <button
                    key={option.mode}
                    type="button"
                    onClick={e => closeAndRun(e, () => onExportImage(option.mode))}
                >
                    <span className={`dot ${option.dotClass}`} />
                    {option.label}
                </button>
            ))}

            <hr className="dropdown-divider" />
            <div className="dropdown-section-title">Trocas</div>
            <button
                type="button"
                id="copyTradeTextBtn"
                onClick={e => closeAndRun(e, onCopyTradeText)}
            >
                <span className="dot dot-text" />
                Lista de trocas (texto)
            </button>
            <button
                type="button"
                id="copyTradeGridBtn"
                onClick={e => closeAndRun(e, onCopyTradeGrid)}
            >
                <span className="dot dot-text" />
                Grade de trocas (texto)
            </button>

            <hr className="dropdown-divider" />
            <div className="dropdown-section-title">Dados</div>
            <button
                type="button"
                id="exportBackupBtn"
                onClick={e => closeAndRun(e, onExportBackup)}
            >
                <span className="dot dot-backup" />
                Backup dos dados (JSON)
            </button>
            {!viewMode && (
                <button
                    type="button"
                    id="importBtn"
                    onClick={e => closeAndRun(e, onTriggerImport)}
                >
                    <span className="dot dot-collected" />
                    Importar dados (JSON)
                </button>
            )}
        </ModalDialog>
    );
}

