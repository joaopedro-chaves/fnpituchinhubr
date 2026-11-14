/* ===================================================
   DOM & UI Utility Functions
   =================================================== */

const MAX_VISIBLE_TOASTS = 4;

function getToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Notificações');
        if (Object.hasOwn(HTMLElement.prototype, 'popover')) {
            container.setAttribute('popover', 'manual');
        }
        document.body.appendChild(container);
    }
    return container;
}

function showToastRegion(container) {
    if (typeof container.showPopover !== 'function') return;
    try {
        const hasOpenModal = Boolean(document.querySelector('dialog[open]'));
        if (container.matches(':popover-open')) {
            if (!hasOpenModal || container.contains(document.activeElement)) return;
            container.hidePopover();
        }
        container.showPopover();
    } catch {
        /* Ignora falha ao promover região para top-layer */
    }
}

function hideToastRegionIfEmpty(container) {
    if (container.childElementCount > 0 || typeof container.hidePopover !== 'function') return;
    try {
        if (container.matches(':popover-open')) {
            container.hidePopover();
        }
    } catch {
        /* Ignora falha ao ocultar região vazia */
    }
}

/** @typedef {HTMLDivElement & { __dismissToast?: () => void }} ToastElement */

export function toast(message, type = 'info', options = {}) {
    const container = getToastContainer();
    const el = /** @type {ToastElement} */ (document.createElement('div'));
    const hasAction = Boolean(options?.actionLabel);
    const defaultDuration = hasAction ? 5000 : 2500;
    const duration = Number.isFinite(options?.duration) ? options.duration : defaultDuration;

    el.className = `toast toast-${type}${hasAction ? ' has-action' : ''}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

    const textEl = document.createElement('span');
    textEl.className = 'toast-message';
    textEl.textContent = message;
    el.appendChild(textEl);

    let dismissed = false;
    /** @type {ReturnType<typeof setTimeout> | null} */
    let autoHideTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    let fallbackRemoveTimer = null;
    let timerStartedAt = Date.now();
    let remainingMs = duration;
    let hovered = false;
    let focused = false;
    /** @type {HTMLElement | null} */
    let priorExternalFocus = null;

    const removeToastNode = () => {
        if (fallbackRemoveTimer !== null) {
            clearTimeout(fallbackRemoveTimer);
            fallbackRemoveTimer = null;
        }
        if (el.isConnected) {
            el.remove();
        }
        hideToastRegionIfEmpty(container);
    };

    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        if (autoHideTimer !== null) {
            clearTimeout(autoHideTimer);
            autoHideTimer = null;
        }
        const focusWasInside = el.contains(document.activeElement);
        el.classList.add('dismissing');
        el.classList.remove('visible');
        if ('inert' in el) {
            el.inert = true;
        }
        const actionBtn = el.querySelector('.toast-action');
        if (actionBtn instanceof HTMLButtonElement) {
            actionBtn.disabled = true;
        }
        el.addEventListener('transitionend', removeToastNode, { once: true });
        fallbackRemoveTimer = setTimeout(removeToastNode, 500);

        if (focusWasInside) {
            const nextControl = [...container.querySelectorAll('.toast-action')].find(
                btn => !el.contains(btn) && !btn.closest('.toast')?.classList.contains('dismissing')
            );
            if (nextControl instanceof HTMLElement) {
                nextControl.focus({ preventScroll: true });
            } else if (priorExternalFocus?.isConnected) {
                priorExternalFocus.focus({ preventScroll: true });
            }
        }
    };

    el.__dismissToast = dismiss;

    const pauseTimer = () => {
        if (autoHideTimer !== null) {
            clearTimeout(autoHideTimer);
            autoHideTimer = null;
            remainingMs = Math.max(1000, remainingMs - (Date.now() - timerStartedAt));
        }
    };

    const resumeTimer = () => {
        if (dismissed || hovered || focused || autoHideTimer !== null) return;
        timerStartedAt = Date.now();
        autoHideTimer = setTimeout(dismiss, remainingMs);
    };

    el.addEventListener('pointerenter', () => {
        hovered = true;
        pauseTimer();
    });
    el.addEventListener('pointerleave', () => {
        hovered = false;
        resumeTimer();
    });
    el.addEventListener('focusin', e => {
        focused = true;
        if (e.relatedTarget instanceof HTMLElement && !container.contains(e.relatedTarget)) {
            priorExternalFocus = e.relatedTarget;
        }
        pauseTimer();
    });
    el.addEventListener('focusout', e => {
        if (e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) return;
        focused = false;
        resumeTimer();
    });

    if (hasAction) {
        const actionBtn = document.createElement('button');
        actionBtn.type = 'button';
        actionBtn.className = 'toast-action';
        actionBtn.textContent = options.actionLabel;
        actionBtn.addEventListener('click', () => {
            options.onAction?.();
            dismiss();
        });
        el.appendChild(actionBtn);
    }

    while (container.childElementCount >= MAX_VISIBLE_TOASTS) {
        const oldest = /** @type {ToastElement | null} */ (container.firstElementChild);
        if (typeof oldest?.__dismissToast === 'function') {
            oldest.__dismissToast();
        }
        if (oldest?.isConnected) {
            oldest.remove();
        }
    }

    container.appendChild(el);
    showToastRegion(container);
    requestAnimationFrame(() => el.classList.add('visible'));
    resumeTimer();
}

export function isIOS() {
    return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
}

function legacyCopyText(text) {
    if (typeof document.execCommand !== 'function') return false;
    const field = Object.assign(document.createElement('textarea'), { value: text });
    field.setAttribute('readonly', '');
    field.setAttribute('aria-hidden', 'true');
    field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0;pointer-events:none';
    document.body.append(field);
    field.select();
    try {
        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        field.remove();
    }
}

export function copyText(text, successMsg, errorMsg, successOptions) {
    const notifyFailure = () => {
        const msg =
            window.isSecureContext === false
                ? `${errorMsg} (requer HTTPS ou permissão de cópia)`
                : errorMsg;
        toast(msg, 'error');
    };

    if (!navigator.clipboard?.writeText) {
        if (legacyCopyText(text)) {
            toast(successMsg, 'success', successOptions);
        } else {
            notifyFailure();
        }
        return;
    }

    navigator.clipboard
        .writeText(text)
        .then(() => {
            toast(successMsg, 'success', successOptions);
        })
        .catch(() => {
            if (legacyCopyText(text)) {
                toast(successMsg, 'success', successOptions);
            } else {
                notifyFailure();
            }
        });
}

export function drawRoundRect(ctx, x, y, width, height, radius = 8) {
    if (ctx.roundRect) {
        ctx.roundRect(x, y, width, height, radius);
    } else {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}
