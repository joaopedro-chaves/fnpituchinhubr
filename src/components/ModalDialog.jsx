import { useEffect, useRef, useCallback } from 'react';

function supportsNativeModal(dialog) {
    return Boolean(dialog && typeof dialog.showModal === 'function');
}

export function closeEnclosingDialog(triggerEl, afterClose) {
    const dialog = triggerEl?.closest?.('dialog');
    if (dialog?.open && typeof dialog.close === 'function') {
        dialog.close();
    } else if (dialog?.hasAttribute('open')) {
        dialog.removeAttribute('open');
    }
    afterClose?.();
}

export function ModalDialog({ title, titleId, bodyAriaLabel, onClose, children }) {
    const dialogRef = useRef(null);
    const closeBtnRef = useRef(null);
    const closedNotifiedRef = useRef(false);

    const notifyClose = useCallback(() => {
        if (closedNotifiedRef.current) return;
        closedNotifiedRef.current = true;
        onClose();
    }, [onClose]);

    const handleCloseClick = useCallback(() => {
        const dialog = dialogRef.current;
        if (dialog?.open && typeof dialog.close === 'function') {
            dialog.close();
        } else if (dialog?.hasAttribute('open')) {
            dialog.removeAttribute('open');
        }
        notifyClose();
    }, [notifyClose]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return undefined;

        closedNotifiedRef.current = false;
        // Atributo experimental de light-dismiss nativo; definido imperativamente para evitar falso positivo do linter JSX
        dialog.setAttribute('closedby', 'any');

        if (supportsNativeModal(dialog)) {
            if (!dialog.open) {
                dialog.showModal();
            }
            return undefined;
        }

        // Fallback apenas para ambientes sem HTMLDialogElement.showModal (ex.: jsdom)
        dialog.setAttribute('open', '');
        closeBtnRef.current?.focus?.({ preventScroll: true });

        const handleKeyDown = e => {
            if (e.key === 'Escape') {
                e.preventDefault();
                dialog.removeAttribute('open');
                notifyClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [notifyClose]);

    // Fallback de light-dismiss para navegadores sem <dialog closedby="any"> (ex.: Safari)
    useEffect(() => {
        const dialog = dialogRef.current;
        if (
            !dialog ||
            (typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype)
        ) {
            return undefined;
        }

        let pressedOutside = false;
        const isOutside = e => {
            const rect = dialog.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) {
                return e.target === dialog;
            }
            return (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
            );
        };

        const handlePointerDown = e => {
            pressedOutside = isOutside(e);
        };
        const handlePointerUp = e => {
            if (pressedOutside && isOutside(e)) {
                if (dialog.open && typeof dialog.close === 'function') {
                    dialog.close();
                } else {
                    dialog.removeAttribute('open');
                }
                notifyClose();
            }
            pressedOutside = false;
        };

        dialog.addEventListener('pointerdown', handlePointerDown);
        dialog.addEventListener('pointerup', handlePointerUp);
        return () => {
            dialog.removeEventListener('pointerdown', handlePointerDown);
            dialog.removeEventListener('pointerup', handlePointerUp);
        };
    }, [notifyClose]);

    return (
        <dialog
            ref={dialogRef}
            className="modal-popup"
            aria-labelledby={titleId}
            onClose={notifyClose}
        >
            <div className="modal-header">
                <h2 id={titleId} className="modal-title">
                    {title}
                </h2>
                <button
                    ref={closeBtnRef}
                    type="button"
                    className="modal-close-btn"
                    onClick={handleCloseClick}
                    aria-label="Fechar"
                    autoFocus
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
            <div className="modal-body" aria-label={bodyAriaLabel}>
                {children}
            </div>
        </dialog>
    );
}
