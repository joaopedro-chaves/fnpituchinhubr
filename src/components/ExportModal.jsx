export default function ExportModal({
    onClose,
    onExportImage,
    onCopyTradeText,
    onCopyTradeGrid,
    onExportBackup,
    onTriggerImport,
}) {
    return (
        <div className="modal-backdrop" onClick={onClose} role="presentation">
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
                <div className="modal-body" aria-label="Opções de exportação e dados">
                    <div className="dropdown-section-title">Imagens</div>
                    <button type="button" onClick={() => onExportImage('collected')}>
                        <span className="dot dot-collected" />
                        Coleção
                    </button>
                    <button type="button" onClick={() => onExportImage('missing')}>
                        <span className="dot dot-missing" />
                        Faltando
                    </button>
                    <button type="button" onClick={() => onExportImage('unmastered')}>
                        <span className="dot dot-unmastered" />
                        Não dominados
                    </button>
                    <button type="button" onClick={() => onExportImage('mastered')}>
                        <span className="dot dot-mastered" />
                        Dominados
                    </button>
                    <button type="button" onClick={() => onExportImage('trade')}>
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
                            onClose();
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
                            onClose();
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
                            onClose();
                        }}
                    >
                        <span className="dot dot-backup" />
                        Backup dos dados (JSON)
                    </button>
                    <button type="button" id="importBtn" onClick={onTriggerImport}>
                        <span className="dot dot-collected" />
                        Importar dados (JSON)
                    </button>
                </div>
            </div>
        </div>
    );
}

