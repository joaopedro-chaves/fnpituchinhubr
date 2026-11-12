/* ===================================================
   DOM & UI Utility Functions
   =================================================== */

export function toast(message, type = 'info', options = {}) {
    const el = document.createElement('div');
    const hasAction = Boolean(options?.actionLabel);
    el.className = `toast toast-${type}${hasAction ? ' has-action' : ''}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

    const textEl = document.createElement('span');
    textEl.className = 'toast-message';
    textEl.textContent = message;
    el.appendChild(textEl);

    let dismissed = false;
    let autoHideTimer = null;
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        if (autoHideTimer !== null) {
            clearTimeout(autoHideTimer);
            autoHideTimer = null;
        }
        el.classList.remove('visible');
        el.addEventListener('transitionend', () => el.remove(), { once: true });
        setTimeout(() => el.remove(), 500);
    };

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

    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('visible'));
    autoHideTimer = setTimeout(dismiss, 2500);
}

export function isIOS() {
    return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
}

export function copyText(text, successMsg, errorMsg, successOptions) {
    if (!navigator.clipboard?.writeText) {
        toast(errorMsg, 'error');
        return;
    }

    navigator.clipboard
        .writeText(text)
        .then(() => {
            toast(successMsg, 'success', successOptions);
        })
        .catch(() => {
            toast(errorMsg, 'error');
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
